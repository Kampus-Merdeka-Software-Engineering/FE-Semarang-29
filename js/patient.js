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


async function displayPatientInfo(query) {
    const patientTable = document.getElementById('patient-list-table');
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
            let formatDate = new Date(patient.checkin_date).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})
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
    } catch (error) {
        patientTable.innerHTML = `${error.message}<p>Error fetching patient information. Please try again later.</p>`;
    }
}

displayPatientInfo('')

