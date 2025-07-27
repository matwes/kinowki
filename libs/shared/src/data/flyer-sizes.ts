export const flyerSizes = [
  { value: 1, label: '105×148 mm (A6 pionowa)' },
  { value: 2, label: '148×105 mm (A6 pozioma)' },
  { value: 3, label: '148×210 mm (A5 pionowa)' },
  { value: 4, label: '210×148 mm (A5 pozioma)' },
  { value: 5, label: '210×297 mm (A4 pionowa)' },
  { value: 6, label: '297×210 mm (A4 pozioma)' },
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
].sort(sortSizes);

export const flyerSizeMap = flyerSizes.reduce(
  (map, genre) => ({ ...map, [genre.value]: genre.label }),
  {} as Record<number, string>
);

function sortSizes(a: { label: string }, b: { label: string }): number {
  const sizeA = parseDimensions(a.label);
  const sizeB = parseDimensions(b.label);

  const isVerticalA = sizeA.width < sizeA.height;
  const isVerticalB = sizeB.width < sizeB.height;
  const isHorizontalA = sizeA.width > sizeA.height;
  const isHorizontalB = sizeB.width > sizeB.height;

  const areaA = sizeA.width * sizeA.height;
  const areaB = sizeB.width * sizeB.height;

  if (isVerticalA && !isVerticalB) {
    return -1;
  }
  if (!isVerticalA && isVerticalB) {
    return 1;
  }

  if (isHorizontalA && !isHorizontalB) {
    return -1;
  }
  if (!isHorizontalA && isHorizontalB) {
    return 1;
  }

  if (areaA !== areaB) {
    return areaA - areaB;
  }

  return sizeA.height - sizeB.height;
}

function parseDimensions(label: string): { width: number; height: number } {
  const match = label.match(/(\d+)×(\d+)/);
  if (!match) {
    throw new Error(`Invalid label format: ${label}`);
  }
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10),
  };
}
