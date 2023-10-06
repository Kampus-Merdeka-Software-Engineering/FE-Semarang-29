async function fetchPatientInfo(query) {
    try {
        const response = await fetch(`http://localhost:3000/patients${query}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching room information:', error);
        throw error;
    }
}

function closeDialog(dialogId) {
    alert('Do you want to close this tab?');
  document.getElementById(dialogId).close();
}


async function displayPatientInfo(query) {
    const patientTable = document.getElementById('patient-list-table');
    patientTable.innerHTML = 'Loading patients information...';
  
    try {
      const patientData = await fetchPatientInfo(query);
      patientData.patients.sort((a, b) => {
        const availabilityA = a.status.toLowerCase();
        const availabilityB = b.status.toLowerCase();
      
        // Sort by availability first
        if (availabilityA < availabilityB) return -1;
        if (availabilityA > availabilityB) return 1;
      
        // If availability is the same, sort by checkin_date in descending order
        const dateA = new Date(a.checkin_date);
        const dateB = new Date(b.checkin_date);
        return dateB - dateA;
      });
  
      let patientsHTML = `<tr>
        <th class="list-name-patient">Name</th>
        <th class="list-room">Room</th>
        <th class="list-checkin">Check In Date</th>
        <th class="list-status">Status</th>
        <th class="list-checkout">Info</th>
        </tr>`;
  
  
      patientData.patients.forEach(patient => {
        let status_class = "";
        let room = ""
        let buttonHTML = "";
        if (patient.status === "Checked In") {
          status_class = "status-ci";
          buttonHTML = `<button class="check-out">Check-Out</button>`;
        } else if (patient.status === "Discharged") {
          status_class = "status-d"
          buttonHTML = ``
        }

        if (patient.room_id == null) {
            room = ""
        } else {
            room = patient.room_id
        }
        let formatDate = new Date(patient.checkin_date).toLocaleDateString('en-us', {
          year: "numeric",
          month: "short",
          day: "numeric"
        });

  
        patientsHTML += `
          <tr>
          <td class="list-name-patient">${patient.name}</td>
          <td class="list-room">${room}</td>
          <td class="list-checkin">${formatDate}</td>
          <td class="list-status"><div class="${status_class}">${patient.status}</div></td>
          <td class="list-checkout">
              <div class="flex-row day-row">
                  <button class="view-info">View Info</button>
                  ${buttonHTML}
              </div>
          </td>
        </tr>`;
      });
  
      patientTable.innerHTML = `${patientsHTML}`;
  
      // Attach event listeners to the "View Info" buttons
      const viewInfoButtons = document.querySelectorAll('.view-info');
      viewInfoButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          const patient = patientData.patients[index];
          openPatientDialog(patient);
        });
      });
  
      const checkOutButtons = document.querySelectorAll('.check-out');
      checkOutButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          const patient = patientData.patients[index].patient_id;
          checkOut(patient);
        })
      })
    } catch (error) {
      patientTable.innerHTML = `${error.message}<p>Error fetching patient information. Please try again later.</p>`;
    }
  }

displayPatientInfo('')

async function fetchPatientInRoom(query) {
    try {
      const response = await fetch(`http://localhost:3000/patient/?${query}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching room information:', error);
      throw error;
    }
  }


function openPatientDialog(patient) {
    const dialog = document.getElementById('patient-info');
    dialog.showModal()
    dialog.innerHTML = '<p>Loading patient and room information...</p>';
    fetchPatientInRoom(`patient_id=${patient.patient_id}`).then(data => {
        let formatDate = new Date(data.response.patient.checkin_date).toLocaleDateString('en-us', {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
        dialog.innerHTML = `<h1 class="no-margin Hos-Name">R. ${data.response.patient.room_id}</h1>
        <table>
            <tr>
                <td class="data-table table-name">Name:</td>
                <td class="data-table table-name">${data.response.patient.name}</td>
            </tr>
  
            <tr>
                <td class="data-table table-area">Patient ID:</td>
                <td class="data-table table-area">${data.response.patient.patient_id}</td>
            </tr>
  
            <tr>
                <td class="data-table table-status">Check In Date:</td>
                <td class="data-table table-status">${formatDate}</td>
            </tr>
  
            <tr>
                <td class="data-table table-status">Room Type:</td>
                <td class="data-table table-status">${data.response.patient.room.room_type}</td>
            </tr>
  
            <tr>
                <td class="data-table table-status">Doctor:</td>
                <td class="data-table table-status">${data.response.patient.doctor.name}</td>
            </tr>
        </table>
        <button id="nosave" onclick="closeDialog('patient-info')">Close</button>`;
      })
      .catch(error => {
        dialog.innerHTML = `${error} <p>Error fetching data.</p>`;
      });
  }

  async function checkOut(id) {
    try {
      const confirmation = confirm('Are you sure you want to check out this patient?');
      if (!confirmation) {
        return; // If the user cancels, do not proceed with the checkout
      }
      const response = await fetch(`http://localhost:3000/patient/?patient_id=${id}`, {
        method: 'PUT'
      });
  
      if (response.ok) {
        displayPatientInfo('?status=Checked In')
        getRoomCount()
      }
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }


  const filters = document.querySelectorAll('.filter-button');

filters.forEach(filter => {
    filter.addEventListener('click', filterButton)
})


  function filterButton(event){
    const clicked = event.target;
    let criteria = clicked.textContent;
    
    var table = document.getElementById("patient-list-table");
    var rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName("td");
        var shouldDisplay = false;

        if (criteria == "All") {
            shouldDisplay = true;
        }
        else if (cells[3].textContent == criteria){
            shouldDisplay = true;
        }
        
        rows[i].style.display = shouldDisplay ? "": "none";
    }
}
