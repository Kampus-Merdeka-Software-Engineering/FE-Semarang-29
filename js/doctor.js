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