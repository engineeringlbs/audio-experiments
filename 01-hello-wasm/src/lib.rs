use wasm_bindgen::prelude::*;
use web_sys::{ AudioContext, OscillatorType };

// Converts a midi note to frequency.
// A midi note is an integer, generally in the range of 21 to 108
pub fn midi_to_freq(note: u8) -> f32 {
    27.5 * (2f32).powf(((note as f32) - 21.0) / 12.0)
}

#[wasm_bindgen]
pub struct FMOscillator {
    ctx: AudioContext,
    osc: web_sys::OscillatorNode,
    gain: web_sys::GainNode,
    fm_gain: web_sys::GainNode,
    fm_osc: web_sys::OscillatorNode,
    // The ratio between the osc frequency and the fm_osc frequency.
    // Generally fractional values like 1/2 or 1/4 sound best.
    freq_ratio: f32,
    gain_ratio: f32,
}

impl Drop for FMOscillator {
    fn drop(&mut self) {
        let _ = self.ctx.close();
    }
}

#[wasm_bindgen]
impl FMOscillator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<FMOscillator, JsValue> {
        let ctx = web_sys::AudioContext::new()?;
        let osc = ctx.create_oscillator()?;
        let fm_osc = ctx.create_oscillator()?;
        let gain = ctx.create_gain()?;
        let fm_gain = ctx.create_gain()?;

        osc.set_type(OscillatorType::Sine);
        osc.frequency().set_value(440.0);
        gain.gain().set_value(0.0);
        fm_gain.gain().set_value(0.0);
        fm_osc.set_type(OscillatorType::Sine);
        fm_osc.frequency().set_value(0.0);

        osc.connect_with_audio_node(&gain)?;
        gain.connect_with_audio_node(&ctx.destination())?;
        fm_osc.connect_with_audio_node(&fm_gain)?;
        fm_gain.connect_with_audio_param(&osc.frequency())?;

        osc.start()?;
        fm_osc.start()?;

        Ok(FMOscillator {
            ctx,
            osc,
            gain,
            fm_gain,
            fm_osc,
            freq_ratio: 0.0,
            gain_ratio: 0.0,
        })
    }

    #[wasm_bindgen]
    pub fn set_gain(&self, mut gain: f32) {
        if gain > 1.0 {
            gain = 1.0;
        }
        if gain < 0.0 {
            gain = 0.0;
        }

        self.gain.gain().set_value(gain);
    }

    #[wasm_bindgen]
    pub fn set_osc_frequency(&self, freq: f32) {
        self.osc.frequency().set_value(freq);
        // The frequency of the FM oscillator depends on the frequency of the
        // osc oscillator, so we update the frequency of both in this method.
        self.fm_osc.frequency().set_value(self.freq_ratio * freq);
        self.fm_gain.gain().set_value(self.gain_ratio * freq);
    }

    #[wasm_bindgen]
    pub fn set_note(&self, note: u8) {
        let freq = midi_to_freq(note);
        self.set_osc_frequency(freq);
    }

    #[wasm_bindgen]
    pub fn set_fm_amount(&mut self, amt: f32) {
        self.gain_ratio = amt;
        let f = self.gain_ratio * self.osc.frequency().value();
        self.fm_gain.gain().set_value(f);
    }

    #[wasm_bindgen]
    pub fn set_fm_frequency(&mut self, amt: f32) {
        self.freq_ratio = amt;
        let f = self.freq_ratio * self.osc.frequency().value();
        self.fm_osc.frequency().set_value(f);
    }
}
