let worksData = [];
let currentFilter = 'todos';
let currentWorkId = null;
let isAudioPlaying = false;
let audioContext = null;
let ambientOscillator = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof serverWorks !== 'undefined') {
        worksData = serverWorks;
        checkUrlParamAndOpen();
    } else {
        fetch('/api/works')
            .then(res => res.json())
            .then(data => {
                worksData = data;
                updateCounts();
                renderWorks(worksData);
                checkUrlParamAndOpen();
            });
    }

    if (worksData.length > 0) {
        updateCounts();
        renderWorks(worksData);
    }
});

function checkUrlParamAndOpen() {
    const urlParams = new URLSearchParams(window.location.search);
    const workId = urlParams.get('obra');
    if (workId) {
        openReader(workId);
    }
}

function updateCounts() {
    const elTodos = document.getElementById('count-todos');
    if (!elTodos) return;

    const favorites = JSON.parse(localStorage.getItem('my_literary_favorites') || '[]');
    const validFavCount = worksData.filter(w => favorites.includes(String(w.id))).length;

    elTodos.innerText = worksData.length;
    document.getElementById('count-poema').innerText = worksData.filter(w => w.type === 'poema').length;
    document.getElementById('count-cuento').innerText = worksData.filter(w => w.type === 'cuento').length;
    document.getElementById('count-reflexion').innerText = worksData.filter(w => w.type === 'reflexion').length;

    const countFav = document.getElementById('count-favoritos');
    if (countFav) {
        countFav.innerText = validFavCount;
    }
}

function renderWorks(data) {
    const grid = document.getElementById('works-grid');
    const noResults = document.getElementById('no-results');
    if (!grid) return;
    grid.innerHTML = '';

    if (data.length === 0) {
        noResults.classList.remove('hidden');
        return;
    } else {
        noResults.classList.add('hidden');
    }

    data.forEach(work => {
        let iconClass = 'fa-scroll';
        let badgeBg = 'bg-amber-100 text-amber-900';
        if (work.type === 'cuento') {
            iconClass = 'fa-book-open';
            badgeBg = 'bg-emerald-100 text-emerald-900';
        } else if (work.type === 'reflexion') {
            iconClass = 'fa-pen-nib';
            badgeBg = 'bg-purple-100 text-purple-900';
        }

        const adminActions = (typeof isAdmin !== 'undefined' && isAdmin) ? `
            <div class="flex items-center space-x-1 ml-2">
                <a href="/admin/edit/${work.id}" class="p-1 text-sepia-700 hover:text-accent-wine transition-colors" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </a>
            </div>
        ` : '';

        const cardHtml = `
            <article class="bg-white rounded-2xl p-6 sm:p-7 border border-sepia-200 shadow-sm hover:shadow-md transition-all-custom flex flex-col justify-between group relative overflow-hidden">
                ${work.featured ? '<div class="absolute top-0 right-0 w-16 h-16 pointer-events-none"><div class="absolute transform rotate-45 bg-accent-gold text-white text-[10px] font-bold py-1 right-[-35px] top-[18px] w-[120px] text-center shadow-sm">Destacado</div></div>' : ''}
                
                <div>
                    <div class="flex items-center justify-between gap-2 mb-4">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${badgeBg} flex items-center gap-1.5">
                            <i class="fa-solid ${iconClass}"></i> ${work.categoryLabel}
                        </span>
                        <div class="flex items-center">
                            <span class="text-xs text-sepia-700">
                                <i class="fa-regular fa-clock mr-1"></i>${work.readTime}
                            </span>
                            ${adminActions}
                        </div>
                    </div>

                    <h3 class="font-title text-xl font-bold text-sepia-900 group-hover:text-accent-wine transition-colors mb-1 cursor-pointer" onclick="openReader('${work.id}')">
                        ${work.title}
                    </h3>
                    <p class="font-handwriting text-lg text-sepia-700 mb-3">
                        ${work.subtitle}
                    </p>

                    <p class="text-sepia-800 text-sm line-clamp-3 leading-relaxed mb-6 font-body">
                        "${work.excerpt}"
                    </p>
                </div>

                <div class="pt-4 border-t border-sepia-100 flex items-center justify-between text-xs">
                    <span class="text-sepia-700">${work.date}</span>
                    <button onclick="openReader('${work.id}')" class="font-semibold text-accent-wine hover:text-sepia-900 flex items-center gap-1 transition-colors">
                        Leer completo <i class="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>
            </article>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function setFilter(type, btnElement) {
    currentFilter = type;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-accent-wine', 'text-white');
        btn.classList.add('bg-sepia-100', 'text-sepia-800');
    });

    if (btnElement) {
        btnElement.classList.remove('bg-sepia-100', 'text-sepia-800');
        btnElement.classList.add('bg-accent-wine', 'text-white');
    }

    applyFiltersAndSort();
}

function filterWorks() {
    applyFiltersAndSort();
}

function sortWorks() {
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    if (!searchInput || !sortSelect) return;

    const query = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    const favorites = JSON.parse(localStorage.getItem('my_literary_favorites') || '[]');

    let filtered = worksData.filter(item => {
        let matchesType = false;
        if (currentFilter === 'todos') {
            matchesType = true;
        } else if (currentFilter === 'favoritos') {
            matchesType = favorites.includes(String(item.id));
        } else {
            matchesType = item.type === currentFilter;
        }

        const matchesQuery = item.title.toLowerCase().includes(query) ||
            item.excerpt.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query);
        return matchesType && matchesQuery;
    });

    if (sortBy === 'populares') {
        filtered.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'lectura') {
        filtered.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
    }

    renderWorks(filtered);
}

function openReader(id) {
    const work = worksData.find(w => String(w.id) === String(id));
    const favorites = JSON.parse(localStorage.getItem('my_literary_favorites') || '[]');
    const bookmarkBtn = document.getElementById('modal-bookmark-btn');
    const bookmarkIcon = bookmarkBtn.querySelector('i');

    if (!work) return;

    currentWorkId = id;
    document.getElementById('modal-title').innerText = work.title;
    document.getElementById('modal-subtitle').innerText = work.subtitle;
    document.getElementById('modal-date').innerText = `Publicado el ${work.date}`;
    document.getElementById('modal-badge').innerText = work.categoryLabel;
    document.getElementById('modal-read-time').innerHTML = `<i class="fa-regular fa-clock"></i> ${work.readTime}`;
    document.getElementById('modal-likes').innerText = work.likes;

    const contentContainer = document.getElementById('modal-content');
    if (work.type === 'poema') {
        contentContainer.className = "versos text-center italic font-body py-4 leading-loose";
        contentContainer.innerText = work.content;
    } else {
        contentContainer.className = "space-y-4 text-justify font-body leading-relaxed";
        contentContainer.innerHTML = work.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
    }

    /* Estado visual del marcapáginas */
    if (favorites.includes(String(id))) {
        bookmarkIcon.className = "fa-solid fa-bookmark text-lg text-accent-wine";
    } else {
        bookmarkIcon.className = "fa-regular fa-bookmark text-lg";
    }

    document.getElementById('reader-modal').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    document.getElementById('modal-scroll-area').scrollTop = 0;
}

function closeReader() {
    document.getElementById('reader-modal').classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function changeFontSize(delta) {
    const content = document.getElementById('modal-content');
    const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
    let currentSizeIndex = 2;
    sizes.forEach((size, idx) => {
        if (content.classList.contains(size)) currentSizeIndex = idx;
    });

    let newIndex = Math.max(0, Math.min(sizes.length - 1, currentSizeIndex + delta));
    sizes.forEach(s => content.classList.remove(s));
    content.classList.add(sizes[newIndex]);
}

function handleLike() {
    if (!currentWorkId) return;
    fetch(`/api/works/${currentWorkId}/like`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const work = worksData.find(w => String(w.id) === String(currentWorkId));
                if (work) work.likes = data.likes;
                document.getElementById('modal-likes').innerText = data.likes;
                showToast('¡Gracias por hacer eco de este poema!');

                const icon = document.getElementById('like-icon');
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid', 'animate-ping');
                setTimeout(() => icon.classList.remove('animate-ping'), 500);
            }
        });
}

function toggleBookmark() {
    if (!currentWorkId) return;

    let favorites = JSON.parse(localStorage.getItem('my_literary_favorites') || '[]');
    const btn = document.getElementById('modal-bookmark-btn');
    const icon = btn.querySelector('i');
    const index = favorites.indexOf(String(currentWorkId));

    if (index === -1) {
        favorites.push(String(currentWorkId));
        icon.className = "fa-solid fa-bookmark text-lg text-accent-wine";
        showToast('Guardado en tus lecturas favoritas');
    } else {
        favorites.splice(index, 1);
        icon.className = "fa-regular fa-bookmark text-lg";
        showToast('Eliminado de favoritos');
    }

    localStorage.setItem('my_literary_favorites', JSON.stringify(favorites));
    updateCounts();
    if (currentFilter === 'favoritos') {
        applyFiltersAndSort();
    }
}

function copyWorkLink() {
    if (!currentWorkId) return;

    // Construir la URL directa a la obra actual
    const shareUrl = `${window.location.origin}/?obra=${currentWorkId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Enlace de la obra copiado al portapapeles 📋');
        }).catch(() => fallbackCopy(shareUrl));
    } else {
        fallbackCopy(shareUrl);
    }
}

function fallbackCopy(text) {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    showToast('Enlace de la obra copiado al portapapeles 📋');
}

function toggleAmbientAudio() {
    const btn = document.getElementById('btn-ambient-audio');
    const icon = document.getElementById('audio-icon');

    if (!isAudioPlaying) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            ambientOscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            ambientOscillator.type = 'sine';
            ambientOscillator.frequency.setValueAtTime(174, audioContext.currentTime);

            gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 3);

            ambientOscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            ambientOscillator.start();
            isAudioPlaying = true;

            btn.classList.add('bg-accent-wine', 'text-white');
            btn.classList.remove('bg-sepia-100', 'text-sepia-800');
            icon.classList.remove('text-accent-wine');
            showToast('Música ambiental activada 🎵');
        } catch (e) {
            showToast('Audio no soportado en este navegador');
        }
    } else {
        if (ambientOscillator) {
            ambientOscillator.stop();
        }
        isAudioPlaying = false;
        btn.classList.remove('bg-accent-wine', 'text-white');
        btn.classList.add('bg-sepia-100', 'text-sepia-800');
        icon.classList.add('text-accent-wine');
        showToast('Música ambiental pausada');
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

function handleSubscribe(e) {
    e.preventDefault();
    const input = e.target.querySelector('input[type="email"]');
    const email = input ? input.value.trim() : '';

    if (!email) return;

    fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const msg = document.getElementById('subscribe-message');
                msg.classList.remove('hidden');
                e.target.reset();
                setTimeout(() => {
                    msg.classList.add('hidden');
                }, 6000);
            } else {
                showToast(data.message || 'Error al procesar la suscripción');
            }
        })
        .catch(() => showToast('Error de conexión al suscribir'));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}