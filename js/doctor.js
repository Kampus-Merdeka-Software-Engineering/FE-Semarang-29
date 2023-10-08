const isLoggedIn = sessionStorage.getItem('isLoggedIn');

if (!isLoggedIn) {
  // User is not logged in, redirect to login page
  window.location.href = 'login.html';
}

function openDialog(DialogID) {
    document.getElementById(DialogID).showModal();
  }

const filters = document.querySelectorAll('.filter-button');

filters.forEach(filter => {
    filter.addEventListener('click', filterButton)
})

function filterButton(event){
    const clicked = event.target;
    let criteria = clicked.textContent;
    
    var table = document.getElementById("doctor-list-table");
    var rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName("td");
        var shouldDisplay = false;

        if (criteria == "All") {
            shouldDisplay = true;
        }
        else if (cells[1].textContent == criteria){
            shouldDisplay = true;
        }
        
        rows[i].style.display = shouldDisplay ? "": "none";
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
            availHTML += `<div class="day-avail">${avail}</div>`
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