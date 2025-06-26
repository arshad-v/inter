// speech.d.ts

interface SpeechRecognitionErrorEventInit extends EventInit {
  error: SpeechRecognitionErrorCode;
  message?: string;
}

// tslint:disable-next-line:interface-name
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
  constructor(type: string, eventInitDict: SpeechRecognitionErrorEventInit);
}

declare var SpeechRecognitionErrorEvent: {
  prototype: SpeechRecognitionErrorEvent;
  new(type: string, eventInitDict: SpeechRecognitionErrorEventInit): SpeechRecognitionErrorEvent;
};

// tslint:disable-next-line:interface-name
interface SpeechRecognitionEventInit extends EventInit {
  resultIndex?: number;
  results: SpeechRecognitionResultList;
}

// tslint:disable-next-line:interface-name
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  readonly interpretation?: any;
  readonly emma?: Document | null;
  constructor(type: string, eventInitDict: SpeechRecognitionEventInit);
}

declare var SpeechRecognitionEvent: {
  prototype: SpeechRecognitionEvent;
  new(type: string, eventInitDict: SpeechRecognitionEventInit): SpeechRecognitionEvent;
};

// tslint:disable-next-line:interface-name
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

// tslint:disable-next-line:interface-name
interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

// tslint:disable-next-line:interface-name
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}
// tslint:disable-next-line:interface-name
interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI?: string;

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare var SpeechRecognition: SpeechRecognitionStatic;

// tslint:disable-next-line:interface-name
interface SpeechGrammar {
  src: string;
  weight: number;
}
declare var SpeechGrammar: {
  prototype: SpeechGrammar;
  new(): SpeechGrammar;
};

// tslint:disable-next-line:interface-name
interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}
declare var SpeechGrammarList: {
  prototype: SpeechGrammarList;
  new(): SpeechGrammarList;
};

interface Window {
  SpeechRecognition?: SpeechRecognitionStatic;
  webkitSpeechRecognition?: SpeechRecognitionStatic;
  SpeechRecognitionEvent?: typeof SpeechRecognitionEvent; // Constructor type
  SpeechRecognitionErrorEvent?: typeof SpeechRecognitionErrorEvent; // Constructor type
}
