import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      securdBlack: string;
      securdWhite: string;
      securdPrimary: string;
      securdPrimaryLight: string;
      securdGrey: string;
      securdLightGrey: string;
      securdDarkBlue: string;
      systemRed: string;
      systemGreen: string;
      systemYellow: string;
    };
  }
}
