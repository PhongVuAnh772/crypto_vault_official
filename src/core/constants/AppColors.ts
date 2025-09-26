const appColors = {
  main: {
    green: "#0066FF", // đổi từ green sang xanh dương chủ đạo
    darkGreen: "#0033CC", // xanh dương đậm
    tokyoRed: "#1E298E", // giữ làm accent đỏ
  },
  light: {
    green: "#E6F0FF", // nền xanh nhạt
    yellow: "#FFF8EB", // cảnh báo nền vàng
    red: "#FFF2F5", // lỗi nền đỏ nhạt
  },
  border: {
    green: "#CCE0FF", // viền xanh nhạt
    yellow: "#FFE58F",
    red: "#FFC6C5",
  },
  gradient: {
    greenBlue: ["#0066FF", "#3A7DE6", "#1E298E"], // gradient chính xanh dương
    green: ["#B3D9FF", "#99C2FF"], // gradient nhạt
  },
  neutral: {
    white: "#FFFFFF",
    black: "#000000",
    n900: "#000000",
    n800: "#272727",
    n700: "#3E3F40",
    n600: "#6C7A8A",
    n500: "#A6B0C0",
    n400: "#C8D0E0",
    n300: "#E7EBF0",
    n200: "#F0F5FF",
    n100: "#F6F8FF",
    n50: "#FAFCFF",
  },
  functional: {
    green: "#108C4A", // success green
    yellow: "#FFB625", // pending / warning
    success: "#2EBD63",
    pending: "#FFB625",
    warning: "#E1251B",
    link: "#1890FF", // link màu xanh dương
    disable: "#CFC2C6",
    upcoming: "#FFAF00",
  },
  other: {
    outline_lightest: "#F8F8FF", // viền nhạt hơn
    verified: "#52E146",
    unverified: "#FFAF00",
    spam: "#E1251B",
    label: "#FFFFFF", // nhãn trên nền xanh
    transparent: "rgba(255, 255, 255, 0)",
    buttonNewUI: "#00000040",
    transparentNewUI: "#FFFFFFB2",
    status_pending: "#FFF0D3",
  },
};
export default appColors;
