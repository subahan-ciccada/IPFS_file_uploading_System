fetch("http://localhost:3000/uploads")
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector(".myTable");
    data.forEach(row => {
      let tableRow = `<tr>
                        <th scope="row">${row.block_address}</th>
                        <td>${row.document_type}</td>
                        <td>${row.retrieve_key}</td>
                        <td>${row.file_path}</td>
                        <td><img src="images/order.png" alt=""></td>
                      </tr>`;
      tableBody.innerHTML += tableRow;
    });
  })
  .catch(error => console.error("Error fetching data:", error));

  
// console.log("script.js is loaded");
