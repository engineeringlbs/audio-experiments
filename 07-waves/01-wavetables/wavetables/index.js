import Bass from './Bass.js'
import BassAmp360 from './BassAmp360.js'
import BassFuzz from './BassFuzz.js'
import BassFuzz2 from './BassFuzz2.js'
import BassSubDub from './BassSubDub.js'
import BassSubDub2 from './BassSubDub2.js'
import Brass from './Brass.js'
import BritBlues from './BritBlues.js'
import BritBluesDriven from './BritBluesDriven.js'
import Buzzy1 from './Buzzy1.js'
import Buzzy2 from './Buzzy2.js'
import Celeste from './Celeste.js'
import ChorusStrings from './ChorusStrings.js'
import Dissonant1 from './Dissonant1.js'
import Dissonant2 from './Dissonant2.js'
import DissonantPiano from './DissonantPiano.js'
import DroppedSaw from './DroppedSaw.js'
import DroppedSquare from './DroppedSquare.js'
import DynaEPBright from './DynaEPBright.js'
import DynaEPMed from './DynaEPMed.js'
import Ethnic33 from './Ethnic33.js'
import Full1 from './Full1.js'
import Full2 from './Full2.js'
import GuitarFuzz from './GuitarFuzz.js'
import Harsh from './Harsh.js'
import MklHard from './MklHard.js'
import Noise from './Noise.js'
import Organ2 from './Organ2.js'
import Organ3 from './Organ3.js'
import PhonemeAh from './PhonemeAh.js'
import PhonemeBah from './PhonemeBah.js'
import PhonemeEe from './PhonemeEe.js'
import PhonemeO from './PhonemeO.js'
import PhonemeOoh from './PhonemeOoh.js'
import PhonemePopAhhhs from './PhonemePopAhhhs.js'
import Piano from './Piano.js'
import Pulse from './Pulse.js'
import PutneyWavering from './PutneyWavering.js'
import Saw from './Saw.js'
import Square from './Square.js'
import TB303Square from './TB303Square.js'
import Throaty from './Throaty.js'
import Triangle from './Triangle.js'
import Trombone from './Trombone.js'
import TwelveOpTines from './TwelveOpTines.js'
import TwelveStringGuitar1 from './TwelveStringGuitar1.js'
import WarmSaw from './WarmSaw.js'
import WarmSquare from './WarmSquare.js'
import WarmTriangle from './WarmTriangle.js'
import Wurlitzer from './Wurlitzer.js'
import Wurlitzer2 from './Wurlitzer2.js'

const wt = {
  Bass,
  BassAmp360,
  BassFuzz,
  BassFuzz2,
  BassSubDub,
  BassSubDub2,
  Brass,
  BritBlues,
  BritBluesDriven,
  Buzzy1,
  Buzzy2,
  Celeste,
  ChorusStrings,
  Dissonant1,
  Dissonant2,
  DissonantPiano,
  DroppedSaw,
  DroppedSquare,
  DynaEPBright,
  DynaEPMed,
  Ethnic33,
  Full1,
  Full2,
  GuitarFuzz,
  Harsh,
  MklHard,
  Noise,
  Organ2,
  Organ3,
  PhonemeAh,
  PhonemeBah,
  PhonemeEe,
  PhonemeO,
  PhonemeOoh,
  PhonemePopAhhhs,
  Piano,
  Pulse,
  PutneyWavering,
  Saw,
  Square,
  TB303Square,
  Throaty,
  Triangle,
  Trombone,
  TwelveOpTines,
  TwelveStringGuitar1,
  WarmSaw,
  WarmSquare,
  WarmTriangle,
  Wurlitzer,
  Wurlitzer2,
}

const wavetables = {}

Object.keys(wt).forEach((key) => {
  const wavetable = {
    name: key,
    real: wt[key].real,
    imag: wt[key].imag,
  }

  wavetables[key] = wavetable
})

export default wavetables
