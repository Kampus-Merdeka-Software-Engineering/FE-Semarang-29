function openDialog(DialogID) {
  document.getElementById(DialogID).showModal();
}

const button = document.getElementById('add-reserve');
const overlay = document.getElementById('overlay');

function closeDialog(dialogId) {
  alert('Do you want to close this tab?');
  document.getElementById(dialogId).close();
}

let isRotated = false;

function showButtons() {
  const hiddenButtons = document.getElementById('hiddenbuttons');
  // hiddenButtons.classList.toggle('hidden');
  hiddenButtons.style.display = (hiddenButtons.style.display === 'none' || hiddenButtons.style.display === '') ? 'block' : 'none';
  overlay.style.display = (overlay.style.display === 'none' || overlay.style.display === '') ? 'block' : 'none';


  const rotateButton = document.getElementById('add-reserve');

  // Toggle the rotated class and update isRotated flag
  if (isRotated) {
    rotateButton.style.animation = 'rotateBackward 0.3s forwards';
  } else {
    rotateButton.style.animation = 'rotateForward 0.3s forwards';
  }

  isRotated = !isRotated;


}


// button.addEventListener('click', showButtons());

const patientForm = document.getElementById('DataPasien');

patientForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const genders = document.getElementsByName('gender');
  let gender = "";
  for (const radio of genders) {
    if (radio.checked) {
      gender = radio.value;
      break; // Stop the loop once a checked radio button is found
    }
  }

  const formData = {
    name: document.getElementsByName('name-patient')[0].value,
    gender: gender,
    address: document.getElementsByName('address')[0].value,
    birthday: document.getElementsByName('birthdate')[0].value,
    birthplace: document.getElementsByName('birthdate')[0].value,
    no_hp: document.getElementsByName('birthdate')[0].value,
    room_number: document.getElementsByName('birthdate')[0].value,
    room_type: document.getElementById('room_type').value
  };

  const name = document.getElementsByName('name-patient')[0].value; // Use [0] to get the first element

  const address = document.getElementsByName('address')[0].value; // Use [0] to get the first element
})

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



displayPatientInfo('?status=Checked In')

async function fetchRoomCount() {
  try {
    const response = await fetch(`http://localhost:3000/roomcount`);
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching room information:', error);
    throw error;
  }
}

async function getRoomCount() {
  const roomDiv = document.getElementById('room-count');
  const regDiv = document.getElementById('reg-count');
  const vipDiv = document.getElementById('vip-count');

  try {
    const data = await fetchRoomCount()

    regDiv.innerHTML = data.count_reg
    vipDiv.innerHTML = data.count_vip
    roomDiv.innerHTML = data.count_reg + data.count_reg
  } catch (error) {
    console.error('Error fetching room information:', error);
    throw error;
  }
}

getRoomCount()

async function pieChart() {
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');

  const perc = document.getElementById('percentage');

  try {
    const dataFetch = await fetchRoomCount()
    const data = [dataFetch.avail_perc, dataFetch.used_perc]

    const colors = ['#04739B', '#D9D9D9']; // Colors for each segment
    const total = data.reduce((acc, val) => acc + val, 0); // Calculate total

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8; // Adjusted radius to fit within canvas

    let startAngle = 0;

    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = colors[i];
      ctx.fill();

      startAngle += sliceAngle;
    }

    perc.innerHTML = `${dataFetch.avail_perc}%`
  } catch (error) {
    canvas.innerHTML = `Cannot show pie chart`
  }

}

pieChart()

// ON PROGRESS

async function displayPatientInfo(query) {
  const patientTable = document.getElementById('patient-list-table');
  const patientCount = document.getElementById('patient-count');
  patientTable.innerHTML = 'Loading patients information...';

  try {
    const patientData = await fetchPatientInfo(query);

    let patientsHTML = `<tr>
      <th class="list-name-patient">Name</th>
      <th class="list-room">Room</th>
      <th class="list-checkin">Check In Date</th>
      <th class="list-status">Status</th>
      <th class="list-checkout">Info</th>
      </tr>`;

    patientData.patients.forEach(patient => {
      let status_class = "";
      let buttonHTML = "";
      if (patient.status === "Checked In") {
        status_class = "status-ci";
        buttonHTML = `<button class="check-out">Check-Out</button>`;
      } else if (patient.status === "Discharged") {
        status_class = "status-d"
      }
      let formatDate = new Date(patient.checkin_date).toLocaleDateString('en-us', {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      
      patientsHTML += `
        <tr>
        <td class="list-name-patient">${patient.name}</td>
        <td class="list-room">${patient.room_id}</td>
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
    patientCount.innerHTML = `${patientData.count}`;

    // Attach event listeners to the "View Info" buttons
    const viewInfoButtons = document.querySelectorAll('.view-info');
    viewInfoButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const patient = patientData.patients[index];
        openPatientDialog(patient);
      });
    });
  } catch (error) {
    patientTable.innerHTML = `${error.message}<p>Error fetching patient information. Please try again later.</p>`;
  }
}

function openPatientDialog(patient) {
  const dialog = document.getElementById('patient-info');
  // Close the dialog
  dialog.close();
  dialog.innerHTML = '<p>Loading patient and room information...</p>';
  // Fetch patient information
  fetchPatientInRoom(`patient_id=${patient.patient_id}`).then(data => {
    dialog.innerHTML = `<p>Patient ID: ${data.response.patient.patient_id}</p>
                        <p>Name: ${data.response.patient.name}</p>
                        <p>Room: ${data.response.patient.room_id}</p>
                        <p>Additional data: ${data.response.patient.room.room_type}</p>
                        <button id="cancel-button">Cancel</button>`;
    // Add event listener to the cancel button
    const cancelButton = dialog.querySelector('#cancel-button');
    cancelButton.addEventListener('click', () => {
      dialog.close();
    });
  }).catch(error => {
    dialog.innerHTML = `${error} <p>Error fetching data.</p>`;
  });
  // Show the dialog
  dialog.showModal();
}

async function displayRoomNumber(query) {
  const roomInfoDiv = document.getElementById('room');
  roomInfoDiv.innerHTML = 'Loading room information...';

  try {
    const roomData = await fetchRoomInfo('');

    let roomsHTML = '';

    roomData.rooms.forEach(room => {
      if (room.isOccupied === false) {
        roomsHTML += `
        <option value="${room.room_id}">R. ${room.room_id}</option>
        `;
      }
    });

    roomInfoDiv.innerHTML = `${roomsHTML}`;
  } catch (error) {
    roomInfoDiv.innerHTML = `<p>Error fetching room information. Please try again later.</p>`;
  }
}

displayRoomNumber('isOccupied=false');
