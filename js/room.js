const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
    // User is not logged in, redirect to login page
    window.location.href = 'login.html';
}

function openDialog(roomNumber) {
    const patientForm = document.getElementById('AddPatientinRoom');
    const roomInput = document.getElementsByName('room-patient')[0];

    // Set the room number in the form
    roomInput.value = roomNumber;

    // Open the dialog
    patientForm.showModal();
}

function confirmclose () {
  const patientForm = document.getElementById('AddPatientinRoom');
  const confirmClose = confirm("Are you sure you want to close without saving?");
  if (confirmClose) {
    patientForm.close();
  }
}

async function openNotAvailDialog(roomNumber) {
    const roomData = document.getElementById('no-avail');
    roomData.innerHTML = '<p>Loading room information...</p>';

    try {
        const response = await fetch(`http://localhost:3000/room/patient/?room_id=${roomNumber}`);
        if (!response.ok) {
            throw new Error('Failed to fetch room information');
        }

        const data = await response.json();

        // Extract the necessary room and patient information
        const {
            patient
        } = data.response.room;

        let formatDate = new Date(patient.checkin_date).toLocaleDateString('en-us', {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        roomData.innerHTML = `
      <h1 class="no-margin Hos-Name">R. ${roomNumber}</h1>
      <table>
          <tr>
              <td class="data-table table-name">Name:</td>
              <td class="data-table table-name">${patient.name}</td>
          </tr>
          <tr>
              <td class="data-table table-status">Patient ID:</td>
              <td class="data-table table-status">${patient.patient_id}</td>
          </tr>
          <tr>
              <td class="data-table table-status">Room Type:</td>
              <td class="data-table table-status">${data.response.room.room_type}</td>
          </tr>
          <tr>
              <td class="data-table table-area">Doctor:</td>
              <td class="data-table table-area">${patient.doctor.name}</td>
          </tr>
          <tr>
              <td class="data-table table-status">Date Checked In:</td>
              <td class="data-table table-status">${formatDate}</td>
          </tr>
      </table>
      <button id="nosave" onclick="closeDialog('no-avail')">Close</button>`;

        roomData.showModal(); // Show the dialog after setting its content
    } catch (error) {
        roomData.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}


function closeDialog(dialogId) {
    if (dialogId == 'AddPatientinRoom') {
        alert('Do you want to close this tab?')
    }
    document.getElementById(dialogId).close();
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

async function displayRoomInfo(query) {
    const roomInfoDiv = document.getElementById('roomInfo');
    roomInfoDiv.innerHTML = 'Loading room information...';

    try {
        const roomData = await fetchRoomInfo('');

        let roomsHTML = '';

        roomData.rooms.forEach(room => {
            let occupied_message = "";
            let occupied_class = "";
            if (room.isOccupied === true) {
                occupied_message = "Reserved"
                occupied_class = "no-avail"
                onlick = "openNotAvailDialog"
            } else if (room.isOccupied === false) {
                occupied_message = "Available"
                occupied_class = "avail"
                onlick = "openDialog"
            }
            roomsHTML += `
      <div class="room-frame ${occupied_class} no-margin" data-room-number="${room.room_id}" onclick="${onlick}(${room.room_id})">
    <h1 id="room-number" class="no-margin">R. ${room.room_id}</h1>
            <h1 id="room-number" style="font-size: smaller; font-weight: 200" class="no-margin">${room.room_type}</h1>
            <h1 id="availabilty" class="no-margin">${occupied_message}</h1>
            </div>
        `;
        });

        roomInfoDiv.innerHTML = `${roomsHTML}`;
    } catch (error) {
        roomInfoDiv.innerHTML = `<p>Error fetching room information. Please try again later.</p>`;
    }
}

function filter_floor(floor) {
    const rooms = document.querySelectorAll('.room-frame');
    rooms.forEach(room => {
        if (floor !== 'all') {
            room.style.display = 'flex';
            const num_div = room.querySelector('#room-number');
            const floor_num = num_div.innerHTML.charAt(3)
            console.log(floor_num)
            if (floor_num != floor) {
                room.style.display = 'none';
            } else {
                room.style.display = 'flex';
            }
        } else {
            room.style.display = 'flex';
        }

    });
}

// ====================== FORM PASIEN DI KAMAR

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

const patientForm = document.getElementById('AddPatientinRoom');
patientForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameInput = document.getElementsByName('name-patient')[0];
        if (!nameInput.value) {
            alert("Please enter a name.");
            return;
        }

        // Validate gender
        const genders = document.getElementsByName('gender-patient');
        let gender = "";
        for (const radio of genders) {
            if (radio.checked) {
                gender = radio.value;
                break;
            }
        }
        if (!gender) {
            alert("Please select a gender.");
            return;
        }

        // Validate address
        const addressInput = document.getElementsByName('address-patient')[0];
        if (!addressInput.value) {
            alert("Please enter an address.");
            return;
        }

        // Validate birthday (you might want to implement a more thorough date validation)
        const birthdayInput = document.getElementsByName('birthdate-patient')[0];
        if (!birthdayInput.value) {
            alert("Please enter a birthday.");
            return;
        }

        // Validate birthplace
        const birthplaceInput = document.getElementsByName('birthplace-patient')[0];
        if (!birthplaceInput.value) {
            alert("Please enter a birthplace.");
            return;
        }

        // Validate phone number (you might want to implement a more thorough phone number validation)
        const phoneInput = document.getElementsByName('phone-patient')[0];
        if (!phoneInput.value) {
            alert("Please enter a phone number.");
            return;
        }

        // Validate email (you might want to implement a more thorough email validation)
        const emailInput = document.getElementsByName('email-patient')[0];
        if (!emailInput.value) {
            alert("Please enter an email.");
            return;
        }

        // Validate blood type
        const bloodTypeInput = document.getElementsByName('bloodtype-patient')[0];
        if (!bloodTypeInput.value) {
            alert("Please enter a blood type.");
            return;
        }

        // Validate room ID
        const roomIdInput = document.getElementsByName('room-patient')[0];
        if (!roomIdInput.value) {
            alert("Please enter a room ID.");
            return;
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
            }.then((response) => {
                if (response.ok) {
                    fetch(`http://localhost:3000/room/?room_id=${formData.room_id}`, {
                        method: 'PUT'
                    }).then((response) => {
                        if (response.ok) {
                            alert("Check in completed!");
                            patientForm.close();
                        } else {
                            alert("Check in Failed");
                        }
                    }).catch((error) => {
                        alert(`${error.message}`);
                    })
                } else {
                    alert("Check in Failed");
                }
            })
            .catch((error) => {
                alert(`${error.message}`);
            })

        )


    }

)

displayRoomInfo('');
displayRoomNumber('isOccupied=false');
displayDoctorsinDataList()