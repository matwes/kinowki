export const flyerSizes = [
  { value: 1, label: 'A6 pionowa', size: '105×148 mm' },
  { value: 2, label: 'A6 pozioma', size: '148×105 mm' },
  { value: 3, label: 'A5 pionowa', size: '148×210 mm' },
  { value: 4, label: 'A5 pozioma', size: '210×148 mm' },
  { value: 5, label: 'A4 pionowa', size: '210×297 mm' },
  { value: 6, label: 'A4 pozioma', size: '297×210 mm' },
  { value: 7, label: '60×60 mm' },
  { value: 8, label: '180×180 mm' },
  { value: 9, label: '65×65 mm' },
  { value: 10, label: '50×148 mm' },
  { value: 11, label: '148×148 mm' },
  { value: 12, label: '105×50 mm' },
  { value: 13, label: '170×190 mm' },
  { value: 14, label: '90×125 mm' },
  { value: 15, label: '120×235 mm' },
  { value: 16, label: '52×74 mm' },
  { value: 17, label: '210×100 mm' },
  { value: 18, label: '95×95 mm' },
  { value: 19, label: '180×50 mm' },
  { value: 20, label: '70×70 mm' },
  { value: 21, label: '210×140 mm' },
  { value: 22, label: '53×149 mm' },
  { value: 23, label: '80×80 mm' },
  { value: 24, label: '195×50 mm' },
  { value: 25, label: '165×115 mm' },
  { value: 26, label: '115×160 mm' },
  { value: 27, label: '100×210 mm' },
  { value: 28, label: '97×205 mm' },
  { value: 29, label: '210×120 mm' },
  { value: 30, label: '120×210 mm' },
  { value: 31, label: '45×200 mm' },
  { value: 32, label: '40×70 mm' },
  { value: 33, label: '125×170 mm' },
  { value: 34, label: '95×195 mm' },
  { value: 35, label: '50×160 mm' },
  { value: 36, label: '90×90 mm' },
  { value: 37, label: '100×100 mm' },
  { value: 38, label: '90×45 mm' },
  { value: 39, label: '52×49 mm' },
  { value: 40, label: '75×105 mm' },
  { value: 41, label: '74×210 mm' },
  { value: 42, label: '138×200 mm' },
  { value: 43, label: '150×147 mm' },
  { value: 44, label: '123×175 mm' },
  { value: 45, label: '105×177 mm' },
  { value: 46, label: '208×108 mm' },
  { value: 47, label: '115×183 mm' },
  { value: 48, label: '115×217 mm' },
  { value: 49, label: '115×175 mm' },
  { value: 50, label: '150×150 mm' },
  { value: 51, label: '90×175 mm' },
  { value: 52, label: '100×200 mm' },
  { value: 53, label: '115×170 mm' },
  { value: 54, label: '108×208 mm' },
  { value: 55, label: '55×80 mm' },
  { value: 56, label: '95×200 mm' },
  { value: 57, label: '200×45 mm' },
  { value: 58, label: '75×150 mm' },
  { value: 59, label: '105×200 mm' },
  { value: 60, label: '210×95 mm' },
  { value: 61, label: '75×100 mm' },
  { value: 62, label: '105×195 mm' },
  { value: 63, label: '105×168 mm' },
  { value: 64, label: '200×40 mm' },
  { value: 65, label: '300×300 mm' },
  { value: 66, label: '70×100 mm' },
  { value: 67, label: '56×86 mm' },
  { value: 68, label: '150×185 mm' },
  { value: 69, label: '130×190 mm' },
  { value: 70, label: '192×103 mm' },
  { value: 71, label: '120×95 mm' },
  { value: 72, label: '90×40 mm' },
  { value: 73, label: '75×75 mm' },
].sort((a, b) => {
  const aStartsWithA = a.label.startsWith('A');
  const bStartsWithA = b.label.startsWith('A');

  if (aStartsWithA && !bStartsWithA) {
    return -1;
  }
  if (!aStartsWithA && bStartsWithA) {
    return 1;
  }

  return a.label.localeCompare(b.label, 'pl', { numeric: true });
});

export const flyerSizeMap = flyerSizes.reduce(
  (map, genre) => ({ ...map, [genre.value]: genre.label }),
  {} as Record<number, string>
);
