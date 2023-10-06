const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.list-a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active2');
    navMenu.classList.toggle('active')
})

document.querySelectorAll('.box-nav').forEach(n => n.addEventListener('click', ()=> {
    hamburger.classList.remove('active2');
    navMenu.classList.remove('active')
}))
