interface IOptions {
  suggestedName: string;
  startIn: string;
  types: {
    description: string;
    accept: {
      [key: string]: string[];
    };
  }[];
}

async function exportFile<T>(data: T, fileName: string, options: IOptions) {
  // @ts-ignore
  const handle = await window.showSaveFilePicker(options);
  const writable = await handle.createWritable();

  await writable.write(data);
  await writable.close();
}

export default exportFile;
