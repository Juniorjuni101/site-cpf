/* ==========================================================================
   ASSESSORIA CPF INTERNACIONAL — SCRIPT PRINCIPAL
   Navegação, revelação ao scroll, formulário, FAQ e modal Pix.

   NOTA SOBRE O ACOMPANHAMENTO
   ---------------------------
   O cliente não consulta nada no site. Quem localiza e comunica é a equipe:
   o protocolo é emitido pela Receita Federal do Brasil quando a documentação
   é submetida presencialmente, e a equipe avisa no grupo de espera.
   ========================================================================== */

/* Marca que o JS está ativo — o CSS só esconde os blocos `.reveal`
   quando esta classe existe (sem JS, o conteúdo fica sempre visível). */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

    /* ======================================================================
       1. HEADER — sombra ao scroll
       ====================================================================== */
    const siteHeader = document.getElementById('siteHeader');
    if (siteHeader) {
        const onScroll = () => {
            siteHeader.classList.toggle('is-scrolled', window.scrollY > 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ======================================================================
       2. NAVEGAÇÃO — drawer mobile + dropdowns
       ====================================================================== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('is-open');
            mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
            mobileMenuBtn.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });
    }

    // Submenus: em desktop abrem por hover (CSS); em mobile, por clique.
    document.querySelectorAll('.nav-item > .nav-link').forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth > 1023) return;
            e.preventDefault();
            const item = trigger.parentElement;
            const willOpen = !item.classList.contains('is-open');

            document.querySelectorAll('.nav-item.is-open').forEach((el) => {
                if (el !== item) {
                    el.classList.remove('is-open');
                    const t = el.querySelector('.nav-link');
                    if (t) t.setAttribute('aria-expanded', 'false');
                }
            });

            item.classList.toggle('is-open', willOpen);
            trigger.setAttribute('aria-expanded', String(willOpen));
        });
    });

    // Fecha o drawer ao clicar num link de navegação
    document.querySelectorAll('#mainNav a').forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth > 1023 || !mainNav) return;
            mainNav.classList.remove('is-open');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    });

    /* ======================================================================
       3. SCROLL REVEAL
       ====================================================================== */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '-50px 0px' });

            revealEls.forEach((el) => observer.observe(el));
        } else {
            revealEls.forEach((el) => el.classList.add('is-visible'));
        }
    }

    /* ======================================================================
       4. UPLOAD DE DOCUMENTO (drag & drop)
       ====================================================================== */
    const dropzone = document.getElementById('dropzone');
    const docFileInput = document.getElementById('docFile');
    const filePreview = document.getElementById('filePreview');

    function updateFilePreview(filename) {
        if (filePreview) {
            filePreview.innerHTML = `<i class="fa-solid fa-circle-check"></i> Arquivo selecionado: <strong>${filename}</strong>`;
        }
    }

    if (dropzone && docFileInput) {
        dropzone.addEventListener('click', () => docFileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '#10B981';
            dropzone.style.backgroundColor = '#ECFDF5';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = '';
            dropzone.style.backgroundColor = '';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = '';
            dropzone.style.backgroundColor = '';
            if (e.dataTransfer.files.length) {
                docFileInput.files = e.dataTransfer.files;
                updateFilePreview(e.dataTransfer.files[0].name);
            }
        });

        docFileInput.addEventListener('change', () => {
            if (docFileInput.files.length) {
                updateFilePreview(docFileInput.files[0].name);
            }
        });
    }

    /* ======================================================================
       5. FORMULÁRIO — confirmação do pedido + Pix de entrada
       ====================================================================== */
    const form = document.getElementById('cpfApplicationForm');
    const pixModal = document.getElementById('pixModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCopyPix = document.getElementById('btnCopyPix');
    const pixKeyInput = document.getElementById('pixKeyInput');
    const btnGoToWhatsappGroup = document.getElementById('btnGoToWhatsappGroup');
    const modalClientName = document.getElementById('modalClientName');

    if (form && pixModal) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const country = document.getElementById('country').value;
            const fullName = document.getElementById('fullName').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const docType = document.getElementById('docType').value;
            const docNumber = document.getElementById('docNumber').value;

            const countryLabel = country === 'MZ'
                ? 'Moçambique'
                : (country === 'AO' ? 'Angola' : 'Exterior');

            if (modalClientName) {
                modalClientName.textContent = fullName;
            }

            const message = encodeURIComponent(
                `*SOLICITAÇÃO DE CPF*\n` +
                `*Nome:* ${fullName}\n` +
                `*País:* ${countryLabel}\n` +
                `*Documento:* ${docType} (${docNumber})\n` +
                `*WhatsApp:* ${whatsapp}\n\n` +
                `Submeti a solicitação no site e gostaria de enviar o comprovante de pagamento dos 50% de entrada.`
            );

            btnGoToWhatsappGroup.href = `https://wa.me/5511999999999?text=${message}`;

            pixModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }

    function closePixModal() {
        if (!pixModal) return;
        pixModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    if (btnCloseModal) btnCloseModal.addEventListener('click', closePixModal);

    if (pixModal) {
        pixModal.addEventListener('click', (e) => {
            if (e.target === pixModal) closePixModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePixModal();
    });

    if (btnCopyPix && pixKeyInput) {
        btnCopyPix.addEventListener('click', () => {
            pixKeyInput.select();
            navigator.clipboard.writeText(pixKeyInput.value).then(() => {
                btnCopyPix.textContent = 'Copiado!';
                setTimeout(() => {
                    btnCopyPix.textContent = 'Copiar Pix';
                }, 3000);
            });
        });
    }

    /* ======================================================================
       6. ACORDEÃO FAQ
       ====================================================================== */
    document.querySelectorAll('.faq-question').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.parentElement.classList.toggle('open');
        });
    });

});
