const csvToRecord = (csvString: string): Record<string, string>[] => {
  const data = csvString.split('\n');
  const headers = data[0].split(',');
  const results: Record<string, string>[] = [];
  data.every((elem, index, arr) => {
    if (index === arr.length) {
      return false;
    }
    const obj = {};
    const currentLine = data[index + 1].split(',');
    headers.forEach((elm, j) => {
      obj[headers[j].trim()] = currentLine[j].trim();
    });
    results.push(obj);
  });
  return results;
};

export { csvToRecord };
