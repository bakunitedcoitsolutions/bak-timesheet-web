import localFont from "next/font/local";

export const centuryGothic = localFont({
  src: [
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanThin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanLight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanLightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanSemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanSemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanBoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanBlack.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/CenturyGothicPaneuropeanBlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-century-gothic",
});

export const tanseekArabic = localFont({
  src: "../../public/assets/fonts/Tanseek-Modern-Pro-Arabic.ttf",
  variable: "--font-arabic",
  display: "swap",
});
