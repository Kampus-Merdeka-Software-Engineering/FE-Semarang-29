const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
  // User is not logged in, redirect to login page
  window.location.href = 'login.html';
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


function openDialog(DialogID) {
  document.getElementById(DialogID).showModal();
}

const filters = document.querySelectorAll('.filter-button');

filters.forEach(filter => {
  filter.addEventListener('click', filterButton)
})

function filterButton(event) {
  const clicked = event.target;
  let criteria = clicked.textContent;

  var table = document.getElementById("doctor-list-table");
  var rows = table.getElementsByTagName("tr");

  if (criteria == "Doctors Available Today") {
    const date = new Date();
    const day = date.getDay().toString(); // Convert day to string
    let daytext = "";
  
    switch (day) {
      case "1":
        daytext = "Monday";
        break;
      case "2":
        daytext = "Tuesday";
        break;
      case "3":
        daytext = "Wednesday";
        break;
      case "4":
        daytext = "Thursday";
        break;
      case "5":
        daytext = "Friday";
        break;
      default:
        break;
    }
  
    for (let i = 1; i < rows.length; i++) {
      const dayAvailElements = rows[i].getElementsByClassName("day-avail");
      let shouldDisplay = false;
  
      for (let j = 0; j < dayAvailElements.length; j++) {
        const day = capitalizeFirstLetter(dayAvailElements[j].textContent);
        if (day === daytext) {
          shouldDisplay = true;
          break;
        }
      }
  
      rows[i].style.display = shouldDisplay ? "" : "none";
    }
  }
  
   else {
    for (let i = 1; i < rows.length; i++) {
      var cells = rows[i].getElementsByTagName("td");
      var shouldDisplay = false;

      if (criteria == "All") {
        shouldDisplay = true;
      } else if (cells[1].textContent == criteria) {
        shouldDisplay = true;
      }

      rows[i].style.display = shouldDisplay ? "" : "none";
    }
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

async function displayDoctorTable() {
  const doctorTable = document.getElementById('doctor-list-table');
  doctorTable.innerHTML = 'Loading doctors information...';

  try {
    const doctorData = await fetchDoctorInfo();


    let doctorHTML = `<tr>
      <th class="list-name">Name</th>
      <th class="list-specialty">Specialty</th>
      <th class="list-availability">Availabilty</th>
  </tr>`;


    doctorData.forEach(doctor => {
      let availHTML = ''
      let status_class = "";
      let buttonHTML = "";
      if (doctor.status === "Checked In") {
        status_class = "status-ci";
        buttonHTML = `<button class="check-out">Check-Out</button>`;
      } else if (doctor.status === "Discharged") {
        status_class = "status-d"
        buttonHTML = ``
      }
      let formatDate = new Date(doctor.checkin_date).toLocaleDateString('en-us', {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      const availability = doctor.availability
      availability.forEach(avail => {
        let availtext = capitalizeFirstLetter(avail)
        availHTML += `<div class="day-avail">${availtext}</div>`
      });
      doctorHTML += `
        <tr>
                    <td class="list-name">${doctor.name}</td>
                    <td class="list-specialty">${doctor.specialty}</td>
                    <td class="list-availability">
                        <div class="flex-row day-row">
                            ${availHTML}
                        </div>
                    </td>
                </tr>`;
    });

    doctorTable.innerHTML = `${doctorHTML}`;


  } catch (error) {
    doctorTable.innerHTML = `${error.message}<p>Error fetching patient information. Please try again later.</p>`;
  }
}

displayDoctorTable()


const doctorForm = document.getElementById('DataDokter');
const doctorDialog = document.getElementById('doctor');

doctorForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const genders = document.getElementsByName('gender-doctor');
    let gender = "";
    for (const radio of genders) {
      if (radio.checked) {
        gender = radio.value;
        break; // Stop the loop once a checked radio button is found
      }
    }


    const avails = document.getElementsByName('availability-doctor');
    let avail = [];
    for (const checkbox of avails) {
      if (checkbox.checked) {
        avail.push(checkbox.value);
      }
    }
    let availtext = avail.join(', ')

    const formData = {
      name: document.getElementsByName('name-doctor')[0].value,
      availability: availtext,
      gender: gender,
      phone: document.getElementsByName('phone-doctor')[0].value,
      email: document.getElementsByName('email-doctor')[0].value,
      specialty: document.getElementsByName('specialty-doctor')[0].value
    };


    fetch("http://localhost:3000/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          specialty: formData.specialty,
          availability: formData.availability
        }),
      })
      .then((response) => {
        if (response.ok) {
          console.log(formData)
          alert("Doctor Added!");
          doctorDialog.close();
          displayDoctorTable()

        } else {
          alert("Add Doctor Failed");
        }
      })
      .catch((error) => {
        alert(`${error.message}`);


      })

  }

)