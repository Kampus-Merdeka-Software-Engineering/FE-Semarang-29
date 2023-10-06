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
  const genders = document.getElementsByName('gender-patient');
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
    address: document.getElementsByName('address-patient')[0].value,
    birthday: document.getElementsByName('birthdate-patient')[0].value,
    birthplace: document.getElementsByName('birthplace-patient')[0].value,
    no_hp: document.getElementsByName('phone-patient')[0].value,
    email: document.getElementsByName('email-patient')[0].value,
    bloodtype: document.getElementsByName('bloodtype-patient')[0].value,
    room_id: document.getElementsByName('room-patient')[0].value,
    doctor_id: document.getElementsByName('doctor-patient')[0].value
  };
  

  fetch("http://localhost:3000/patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        gender: formData.gender,
        address: formData.address,
        birthday: formData.birthday,
        birthplace: formData.birthplace,
        phone: formData.no_hp,
        email: formData.email,
        bloodtype: formData.bloodtype,
        checkin_date: new Date(),
        room_id: formData.room_id,
        doctor_id: formData.doctor_id
      }),
    },
    fetch(`http://localhost:3000/room/?room_id=${formData.room_id}`, {
      method: 'PUT'
    })
    )
    .then((response) => {
      if (response.ok) {
        alert("Check in completed!");
        patientForm.close();
        showButtons();
        displayPatientInfo('?status=Checked In')
        
      } else {
        alert("Check in Failed");
      }
    })
    .catch((error) => {
      alert(`${error.message}`);


    })

     }

)

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
    roomDiv.innerHTML = data.room_count
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
    patientData.patients.sort((a, b) => {
      const dateA = new Date(a.checkin_date);
      const dateB = new Date(b.checkin_date);
      return dateB - dateA; // Sort in descending order
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
      let buttonHTML = "";
      if (patient.status === "Checked In") {
        status_class = "status-ci";
        buttonHTML = `<button class="check-out">Check-Out</button>`;
      } else if (patient.status === "Discharged") {
        status_class = "status-d"
        buttonHTML = ``
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

async function fetchRoomInfo(query) {
  try {
    const response = await fetch(`http://localhost:3000/rooms${query}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching room information:', error);
    throw error;
  }
}

async function displayRoomNumber(query) {
  const roomInfoDiv = document.getElementById('room-datalist');
  roomInfoDiv.innerHTML = 'Loading room information...';

  try {
    const roomData = await fetchRoomInfo('');

    let roomsHTML = '';

    roomData.rooms.forEach(room => {
      if (room.isOccupied === false) {
        roomsHTML += `
        <option value="${room.room_id}"></option>
        `;
      }
    });

    roomInfoDiv.innerHTML = `${roomsHTML}`;
  } catch (error) {
    roomInfoDiv.innerHTML = `<p>Error fetching room information. Please try again later.</p>`;
    console.error(error)
  }
}

async function fetchDoctorInfo() {
  try {
    const response = await fetch(`http://localhost:3000/doctors`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching room information:', error);
    throw error;
  }
}

async function displayDoctorsinDataList() {
  const doctor_datalist = document.getElementById('doctor-datalist');
  doctor_datalist.innerHTML = 'Loading doctor information...';

  try {
    const doctors = await fetchDoctorInfo('');

    let doctorDatalistHTML = '';

    doctors.forEach(doctor => {
      doctorDatalistHTML += `
        <option value="${doctor.doctor_id}">${doctor.name}</option>
        `;
    });

    doctor_datalist.innerHTML = `${doctorDatalistHTML}`;
  } catch (error) {
    doctor_datalist.innerHTML = `<p>Error fetching room information. Please try again later.</p>`;
    console.error(error)
  }
}

displayRoomNumber('isOccupied=false');
displayDoctorsinDataList()