export enum Rate {
  IR = 0,
  KR = 1,
  AR = 2,
  DR = 3
}

export function rateName(rate: Rate): string {
  switch (rate) {
    case Rate.IR: return "scalar";
    case Rate.KR: return "control";
    case Rate.AR: return "audio";
    case Rate.DR: return "demand";
  }
}
