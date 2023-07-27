function addMetadataRow() {
  const container = document.getElementById(
    'metadata-container'
  );
  const row = document.createElement('div');
  // count existing metadata rows
  const rowCount =
    document.getElementsByClassName('metadata-row').length;
  row.className = 'row mt-3 mb-3 metadata-row';
  row.id = `metadata-row-${rowCount}`;
  row.innerHTML = `     
    <div class="col-3">
      <input type="text" class="form-control" name="metadata[${rowCount}][label]" placeholder="label" />
    </div> 
    <div class="col-8">
      <input type="text" class="form-control" name="metadata[${rowCount}][value]" placeholder="value" />
    </div> 
     <div class="col-1">
        <button type="button" class="btn btn-secondary" onClick="deleteMetadataRow(${rowCount})"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"></path> <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"></path> </svg> </button>
    </div>   
    `;
  console.log(row);
  container.appendChild(row);
}

function deleteMetadataRow(rowCount) {
  const row = document.getElementById(
    `metadata-row-${rowCount}`
  );
  row.remove();
}
