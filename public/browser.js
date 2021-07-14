function itemTemplate(item){
    return`
    <tr>
    <td>${item.date}</td>
    <td>${item.person}</td>
    <td class= "Sabah">${item.sabah}</td>
    <td class = "Ogle">${item.ogle}</td>
    <td class = "Aksam">${item.aksam}</td>
    <td>
      <button data-id="${item._id}" class = "editbutton">Düzenle</button>
      <button data-id="${item._id}" class = "deletebutton">Sil</button>
    </td>
    </tr>
    `
}

function histSearch() {
    var searchInput, filter, table, tr, tdSabah, tdOgle, tdAksam, i, txtValueSabah, txtValueOgle, txtValueAksam;
    searchInput = document.getElementById("searchYemek");
    filter = searchInput.value.toUpperCase();
    table = document.getElementById("yemek-history");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        /*for (k= 2; k < 5; k++){*/
            tdSabah = tr[i].getElementsByTagName("td")[2];
            tdOgle = tr[i].getElementsByTagName("td")[3];
            tdAksam = tr[i].getElementsByTagName("td")[4];
            if (tdSabah || tdOgle || tdAksam) {
                txtValueSabah = tdSabah.textContent || tdSabah.innerText;
                txtValueOgle = tdOgle.textContent || tdOgle.innerText;
                txtValueAksam = tdAksam.textContent || tdAksam.innerText;
                if (txtValueSabah.toUpperCase().indexOf(filter) > -1 || txtValueOgle.toUpperCase().indexOf(filter) > -1 || txtValueAksam.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        //}       
    }
  }

//initial page load render with last items

/*let ourHTML = items.slice(-10).map(function(item){
    return itemTemplate(item)
}).join('')
console.log(ourHTML)
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML)

code for yemekapp.js:
          <script>
          let items=${JSON.stringify}
          </script>
*/

//create

document.getElementById("create-form").addEventListener("submit",function(e){
    e.preventDefault()
    let newSabah = document.getElementById("sabah")
    let newOgle = document.getElementById("ogle")
    let newAksam = document.getElementById("aksam")
    let newPerson = document.getElementById("person")
    let newTimestamp = new Date()
    let newTarih = document.getElementById("tarih")
    //(newSabah.value)
    //console.log(newAksam.value)

    axios.post('/feedbacksubmitted', {timestamp: new Date(), date: newTarih.value, person: newPerson.value, sabah: newSabah.value, ogle: newOgle.value, aksam: newAksam.value}).then(function(response){
        document.getElementById("item-list").insertAdjacentHTML("beforebegin",itemTemplate(response.data))
    }).catch(function(){
        console.log("Try again later")
    })
})
//update
document.addEventListener("click", function(e){
    var mdbID = e.target.getAttribute("data-id")
    //console.log(mdbID)
    let newSabah, newOgle, newAksam
    if (e.target.classList.contains("editbutton")){
        let userInputSabah = prompt("Lütfen güncelleyin: Sabah", e.target.parentElement.parentElement.children[2].innerHTML)
        let userInputOgle = prompt("Lütfen güncelleyin: Ogle", e.target.parentElement.parentElement.children[3].innerHTML)
        let userInputAksam = prompt("Lütfen güncelleyin: Aksam", e.target.parentElement.parentElement.children[4].innerHTML)
        if (userInputSabah){
            newSabah = userInputSabah
        } else {
            newSabah = e.target.parentElement.parentElement.children[2].innerHTML  
        }
        if (userInputOgle){
            newOgle = userInputOgle  
        } else {
            newOgle = e.target.parentElement.parentElement.children[3].innerHTML
        }
        if (userInputAksam) {
            newAksam = userInputAksam 
        } else {
            newAksam = e.target.parentElement.parentElement.children[4].innerHTML
            
        }
        //console.log(mdbID)
        axios.post('/update-item', {sabah: newSabah, ogle: newOgle, aksam: newAksam, id: mdbID}).then(function(){
            e.target.parentElement.parentElement.children[2].innerHTML = newSabah
            e.target.parentElement.parentElement.children[3].innerHTML = newOgle
            e.target.parentElement.parentElement.children[4].innerHTML = newAksam
        }).catch(function(){
            console.log("Try again later")
        })
    }
    //delete
    if (e.target.classList.contains("deletebutton")){
        if (confirm("Silmek istediginden emin misin?")){
            axios.post('/delete-item', {id: mdbID}).then(function(){
                e.target.parentElement.parentElement.remove()
            }).catch(function(){
                console.log("Try again later")
            })
        }
    }
})