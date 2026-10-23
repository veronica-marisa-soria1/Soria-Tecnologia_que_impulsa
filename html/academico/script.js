function abrir(id) {
    document.querySelectorAll('.pantalla').forEach(p => {
        p.classList.remove('activa');
        p.style.opacity = 0;
    });
    const nueva = document.getElementById(id);
    if (!nueva) return;
    nueva.classList.add('activa');
    setTimeout(() => nueva.style.opacity = 1, 50);
    window.scrollTo(0, 0);
}

function alternarMenu() {
    const menu = document.getElementById('menuMovil');
    const boton = document.getElementById('botonInstitucion');
    const cortina = document.getElementById('menuCortina');
    if (!menu || !boton || !cortina) return;

    const abierto = menu.classList.toggle('abierto');
    cortina.classList.toggle('activa', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    menu.setAttribute('aria-hidden', String(!abierto));
    document.body.style.overflow = abierto ? 'hidden' : '';
}

function abrirSeccionMenu(id) {
    alternarMenu();
    abrir(id);
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        const menu = document.getElementById('menuMovil');
        if (menu && menu.classList.contains('abierto')) alternarMenu();
    }
});