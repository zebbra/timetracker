import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';
import JsPDF from 'jspdf';

/**
 * Moves an array item from one position in an array to another.
 * Note: This is a pure function so a new array will be returned, instead
 * of altering the array argument.
 *
 * @param {array}   array        array in which to move an item          (required)
 * @param {number}  moveIndex    the index of the item to move           (required)
 * @param {number}  toIndex      the index to move item at moveIndex to  (required)
 */
const move = (array, moveIndex, toIndex) => {
  const item = array[moveIndex];
  const length = array.length;
  const diff = moveIndex - toIndex;

  if (diff > 0) {
    // move left
    return [
      ...array.slice(0, toIndex),
      item,
      ...array.slice(toIndex, moveIndex),
      ...array.slice(moveIndex + 1, length),
    ];
  } else if (diff < 0) {
    // move right
    return [
      ...array.slice(0, moveIndex),
      ...array.slice(moveIndex + 1, toIndex + 1),
      item,
      ...array.slice(toIndex + 1, length),
    ];
  }
  return array;
};

/**
 * Converts seconds to haours, fixed to two decimal places
 *
 * @param {number}    value     the seconds to parse as hours
 */
const secondsAsHours = (value) => (value / 60 / 60).toFixed(2);

/**
 * Takes a time string of the format hh:mm and parses it to a decimal number
 *
 * @param {string} value the time (hh:mm) to parse as decimal number
 */
const timeToDecimal = (value) => {
  const [hours, minutes] = value.split(':');
  return parseFloat(parseInt(hours, 10) + (parseInt(minutes, 10) / 60));
};


const exportToCsv = (filename, rows, separator = ';') => {
  const processRow = (row) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j += 1) {
      let innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) {
        result = `"${result}"`;
      }
      if (j > 0) {
        finalVal += separator;
      }
      finalVal += result;
    }
    finalVal += '\n';
    return finalVal;
  };

  let csvFile = '\uFEFF';
  for (let i = 0; i < rows.length; i += 1) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      link.click();
    }
  }
};

const asPdfWrapper = (toggle, filename) => {
  try {
    toggle();
    setTimeout(() => {
      asPdf(filename)
        .then(() => toggle())
        .catch(() => toggle());
    }, 100);
  } catch (error) {
    toggle();
  }
};

const asPdf = (filename) => {
  const target = document.getElementById('export-content');
  if (!target) {
    return Promise.resolve();
  }

  return html2canvas(target)
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      const doc = new JsPDF('p', 'mm');
      let position = 0; // give some top padding to first page

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position += heightLeft - imgHeight; // top padding for other pages
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`${filename}.pdf`);
    });
};

const downloadImage = (elementId, filename, orientation, format, title) => {
  if (elementId) {
    const node = document.getElementById(elementId);

    // Add page title if one is given
    if (title) {
      const titleWrapper = document.createElement('section');
      const titleNode = document.createElement('h1');
      titleNode.innerText = title;
      titleWrapper.appendChild(titleNode);
      titleWrapper.id = 'export-content-title';
      node.insertBefore(titleWrapper, node.childNodes[0]);
    }

    // Add print class to sections
    // const sections = node.getElementsByTagName('section');
    // for (let i = 0; i < sections.length; i += 1) {
    //   sections[i].className += ' print';
    // }

    return html2canvas(node).then((canvas) => {
      // Remove page title
      if (title) {
        document.getElementById('export-content-title').outerHTML = '';
      }

      // Remove print class for sections
      // for (let i = 0; i < sections.length; i += 1) {
      //   sections[i].className = sections[i].className.replace(/\bprint\b/g, '');
      // }

      if (format && format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const doc = new JsPDF(orientation || 'p', 'mm', [canvas.width, canvas.height]);
        doc.addImage(imgData, 'png', 10, 10, canvas.width, canvas.height);
        doc.save(`${filename}.pdf`);
      } else if (canvas.msToBlob) {
        const blob = canvas.msToBlob();
        FileSaver.saveAs(blob, `${filename}.png`);
      } else {
        canvas.toBlob((blob) => {
          FileSaver.saveAs(blob, `${filename}.png`);
        });
      }
    });
  }
  return Promise.resolve();
};


export {
  move,
  secondsAsHours,
  timeToDecimal,
  exportToCsv,
  asPdf,
  asPdfWrapper,
  downloadImage,
};
