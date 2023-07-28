function addPreviews(event) {
  const uploads = [];
  const files = event.target.files;
  const rowCount =
    document.getElementsByClassName('image-row').length;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    const body = document.getElementById(
      'image-table-body'
    );
    reader.onload = function (event) {
      const html = `
          <td>${rowCount + i + 1}</td>
          <td>
            <img src="${event.target.result}" width="100">
          </td>
          <td>not uploaded</td>
          <td></td>
          <td></td>
        `;
      uploads.push({
        index: i,
        src: event.target.result,
        html,
      });
      if (uploads.length === files.length) {
        const uploadsSorted = uploads.sort((a, b) => {
          if (a.index < b.index) return -1;
          if (a.index > b.index) return 1;
          return 0;
        });
        for (let i = 0; i < uploadsSorted.length; i++) {
          const row = document.createElement('tr');
          row.className = 'image-row';
          row.innerHTML = uploadsSorted[i].html;
          body.appendChild(row);
        }
      }
    };
    reader.readAsDataURL(file);
  }
}
