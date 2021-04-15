export const NO_SCROLL_BAR = `
scrollbar-width: none; /* Firefox */
-ms-overflow-style: none;  /* Internet Explorer 10+ */
&::-webkit-scrollbar {
    width: 0;
    height: 0;
}
`;
