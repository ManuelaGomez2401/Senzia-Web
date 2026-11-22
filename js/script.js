"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     FUNCIONES AUXILIARES
  ===================================================== */

  const $ = (selector, context = document) =>
    context.querySelector(selector);

  const $$ = (selector, context = document) =>
    [...context.querySelectorAll(selector)];

  /*
   * IMPORTANTE:
   * Pega entre las comillas la URL de Google Apps Script
   * que termina en /exec.
   *
   * Ejemplo:
   * https://script.google.com/macros/s/IDENTIFICADOR/exec
   */
  const FORM_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbxxf91FqjGfWM_PgCf_YRzSdkKTW9_Xpemf9ThdDbpA9ElDI9vWNoyFP1iuy11wiL2wKg/exec";

  /* =====================================================
     ELEMENTOS GENERALES
  ===================================================== */

  const header = $("#header");
  const navLinks = $("#navLinks");
  const menuToggle = $("#menuToggle");
  const toTop = $("#toTop");
  const canvas = $("#heroCanvas");
  const year = $("#year");

  /* =====================================================
     AÑO AUTOMÁTICO DEL FOOTER
  ===================================================== */

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* =====================================================
     MENÚ MÓVIL
  ===================================================== */

  const closeMenu = () => {
    navLinks?.classList.remove("open");
    menuToggle?.classList.remove("open");
    document.body.classList.remove("menu-open");

    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Abrir menú");
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen =
      navLinks?.classList.toggle("open") ?? false;

    menuToggle.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );
  });

  if (navLinks) {
    $$("a", navLinks).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });

  /* =====================================================
     ENCABEZADO, VOLVER ARRIBA Y NAVEGACIÓN ACTIVA
  ===================================================== */

  const sections = $$("main section[id]");

  const sectionLinks = $$(
    '.nav-links a[href^="#"]:not(.btn)'
  );

  let scrollTicking = false;

  const updateScrollElements = () => {
    const currentScroll = window.scrollY;

    header?.classList.toggle(
      "scrolled",
      currentScroll > 20
    );

    toTop?.classList.toggle(
      "show",
      currentScroll > 600
    );

    let currentSection = "";

    sections.forEach((section) => {
      if (
        currentScroll >=
        section.offsetTop - 160
      ) {
        currentSection = section.id;
      }
    });

    sectionLinks.forEach((link) => {
      const isActive =
        link.getAttribute("href") ===
        `#${currentSection}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute(
          "aria-current",
          "location"
        );
      } else {
        link.removeAttribute("aria-current");
      }
    });

    scrollTicking = false;
  };

  const onScroll = () => {
    if (scrollTicking) {
      return;
    }

    window.requestAnimationFrame(
      updateScrollElements
    );

    scrollTicking = true;
  };

  window.addEventListener(
    "scroll",
    onScroll,
    {
      passive: true
    }
  );

  updateScrollElements();

  toTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  /* =====================================================
     ANIMACIONES DE APARICIÓN
  ===================================================== */

  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.12
        }
      );

    revealElements.forEach(
      (element, index) => {
        element.style.transitionDelay =
          `${(index % 4) * 70}ms`;

        revealObserver.observe(element);
      }
    );
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  /* =====================================================
     CONTADORES ANIMADOS
  ===================================================== */

  const animateCount = (element) => {
    const target = Number(
      element.dataset.count
    );

    if (!Number.isFinite(target)) {
      return;
    }

    const suffix =
      element.dataset.suffix || "";

    const duration = 1200;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const progress = Math.min(
        (currentTime - startTime) /
          duration,
        1
      );

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(
        target * easedProgress
      );

      element.textContent =
        `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(
          updateCounter
        );
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const counters = $$("[data-count]");

  if ("IntersectionObserver" in window) {
    const countObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.6
        }
      );

    counters.forEach((counter) => {
      countObserver.observe(counter);
    });
  } else {
    counters.forEach(animateCount);
  }

  /* =====================================================
     FONDO ANIMADO DEL HERO
  ===================================================== */

  if (canvas && canvas.getContext) {
    const context =
      canvas.getContext("2d");

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    let width = 0;
    let height = 0;
    let nodes = [];
    let animationId = null;
    let heroVisible = true;

    const mouse = {
      x: null,
      y: null
    };

    const drawFrame = (
      moveNodes = false
    ) => {
      context.clearRect(
        0,
        0,
        width,
        height
      );

      nodes.forEach((node, index) => {
        if (moveNodes) {
          node.x += node.vx;
          node.y += node.vy;

          if (
            node.x < 0 ||
            node.x > width
          ) {
            node.vx *= -1;
          }

          if (
            node.y < 0 ||
            node.y > height
          ) {
            node.vy *= -1;
          }
        }

        context.beginPath();

        context.arc(
          node.x,
          node.y,
          node.radius,
          0,
          Math.PI * 2
        );

        context.fillStyle =
          "rgba(34, 211, 238, 0.8)";

        context.fill();

        for (
          let next = index + 1;
          next < nodes.length;
          next += 1
        ) {
          const otherNode =
            nodes[next];

          const distance = Math.hypot(
            node.x - otherNode.x,
            node.y - otherNode.y
          );

          if (distance < 140) {
            const opacity =
              (1 - distance / 140) *
              0.4;

            context.strokeStyle =
              `rgba(139, 92, 246, ${opacity})`;

            context.lineWidth = 1;

            context.beginPath();

            context.moveTo(
              node.x,
              node.y
            );

            context.lineTo(
              otherNode.x,
              otherNode.y
            );

            context.stroke();
          }
        }

        if (
          mouse.x !== null &&
          mouse.y !== null
        ) {
          const mouseDistance =
            Math.hypot(
              node.x - mouse.x,
              node.y - mouse.y
            );

          if (mouseDistance < 160) {
            const mouseOpacity =
              (1 -
                mouseDistance / 160) *
              0.5;

            context.strokeStyle =
              `rgba(34, 211, 238, ${mouseOpacity})`;

            context.beginPath();

            context.moveTo(
              node.x,
              node.y
            );

            context.lineTo(
              mouse.x,
              mouse.y
            );

            context.stroke();
          }
        }
      });
    };

    const resizeCanvas = () => {
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      width = canvas.clientWidth;
      height = canvas.clientHeight;

      canvas.width = Math.round(
        width * pixelRatio
      );

      canvas.height = Math.round(
        height * pixelRatio
      );

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
      );

      const nodeCount = Math.min(
        Math.floor(
          (width * height) / 15000
        ),
        75
      );

      nodes = Array.from(
        {
          length: nodeCount
        },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx:
            (Math.random() - 0.5) *
            0.35,
          vy:
            (Math.random() - 0.5) *
            0.35,
          radius:
            Math.random() * 1.5 +
            0.8
        })
      );

      drawFrame(false);
    };

    const animateCanvas = () => {
      if (!heroVisible || reduceMotion) {
        animationId = null;
        return;
      }

      drawFrame(true);

      animationId =
        requestAnimationFrame(
          animateCanvas
        );
    };

    const startAnimation = () => {
      if (
        !reduceMotion &&
        heroVisible &&
        animationId === null
      ) {
        animationId =
          requestAnimationFrame(
            animateCanvas
          );
      }
    };

    const stopAnimation = () => {
      if (animationId !== null) {
        cancelAnimationFrame(
          animationId
        );
      }

      animationId = null;
    };

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    canvas.parentElement?.addEventListener(
      "mousemove",
      (event) => {
        const canvasRect =
          canvas.getBoundingClientRect();

        mouse.x =
          event.clientX -
          canvasRect.left;

        mouse.y =
          event.clientY -
          canvasRect.top;
      }
    );

    canvas.parentElement?.addEventListener(
      "mouseleave",
      () => {
        mouse.x = null;
        mouse.y = null;
      }
    );

    if (
      "IntersectionObserver" in
        window &&
      !reduceMotion
    ) {
      const heroObserver =
        new IntersectionObserver(
          ([entry]) => {
            heroVisible =
              entry.isIntersecting;

            if (heroVisible) {
              startAnimation();
            } else {
              stopAnimation();
            }
          }
        );

      heroObserver.observe(canvas);
    }

    startAnimation();
  }

  /* =====================================================
     FORMULARIO DE CONTACTO
  ===================================================== */

  const form = $("#contactForm");
  const status = $("#formStatus");
  const submitButton =
    $("#submitButton");

  let sendingForm = false;

  /* -----------------------------------------------------
     MOSTRAR ESTADO DEL FORMULARIO
  ----------------------------------------------------- */

  const setStatus = (
    message,
    type = ""
  ) => {
    if (!status) {
      return;
    }

    status.textContent = message;
    status.className = "form-status";

    if (type) {
      status.classList.add(type);
    }
  };

  /* -----------------------------------------------------
     ACTIVAR O DESACTIVAR BOTÓN
  ----------------------------------------------------- */

  const setLoading = (loading) => {
    sendingForm = loading;

    if (!submitButton) {
      return;
    }

    submitButton.disabled = loading;

    submitButton.textContent = loading
      ? "Enviando..."
      : "Enviar solicitud";
  };

  /* -----------------------------------------------------
     MOSTRAR ERRORES
  ----------------------------------------------------- */

  const setError = (
    fieldName,
    message
  ) => {
    if (!form) {
      return;
    }

    const element =
      form.elements.namedItem(
        fieldName
      );

    const field =
      element?.closest(".field");

    const errorElement = $(
      `.error[data-for="${fieldName}"]`,
      form
    );

    field?.classList.toggle(
      "invalid",
      Boolean(message)
    );

    if (errorElement) {
      errorElement.textContent =
        message;
    }

    if (element) {
      element.setAttribute(
        "aria-invalid",
        String(Boolean(message))
      );
    }
  };

  /* -----------------------------------------------------
     OBTENER VALORES
  ----------------------------------------------------- */

  const getValue = (fieldName) => {
    if (!form) {
      return "";
    }

    const element =
      form.elements.namedItem(
        fieldName
      );

    return (
      element?.value?.trim() || ""
    );
  };

  /* -----------------------------------------------------
     VALIDAR CAMPOS
  ----------------------------------------------------- */

  const validateForm = () => {
    if (!form) {
      return false;
    }

    let isValid = true;

    const nombre =
      getValue("nombre");

    const email =
      getValue("email");

    const servicio =
      getValue("servicio");

    const mensaje =
      getValue("mensaje");

    const autorizacion =
      form.elements.namedItem(
        "autorizacion"
      )?.checked ?? false;

    if (nombre.length < 2) {
      setError(
        "nombre",
        "Escribe tu nombre, mínimo 2 caracteres."
      );

      isValid = false;
    } else if (nombre.length > 80) {
      setError(
        "nombre",
        "El nombre no puede superar 80 caracteres."
      );

      isValid = false;
    } else {
      setError("nombre", "");
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email)) {
      setError(
        "email",
        "Escribe un correo electrónico válido."
      );

      isValid = false;
    } else if (email.length > 120) {
      setError(
        "email",
        "El correo no puede superar 120 caracteres."
      );

      isValid = false;
    } else {
      setError("email", "");
    }

    if (!servicio) {
      setError(
        "servicio",
        "Selecciona un servicio de interés."
      );

      isValid = false;
    } else {
      setError("servicio", "");
    }

    if (mensaje.length < 10) {
      setError(
        "mensaje",
        "Escribe un mensaje de mínimo 10 caracteres."
      );

      isValid = false;
    } else if (
      mensaje.length > 1000
    ) {
      setError(
        "mensaje",
        "El mensaje no puede superar 1000 caracteres."
      );

      isValid = false;
    } else {
      setError("mensaje", "");
    }

    if (!autorizacion) {
      setError(
        "autorizacion",
        "Debes autorizar el uso de los datos para enviar la solicitud."
      );

      isValid = false;
    } else {
      setError(
        "autorizacion",
        ""
      );
    }

    return isValid;
  };

  /* -----------------------------------------------------
     BORRAR ERROR AL ESCRIBIR
  ----------------------------------------------------- */

  form
    ?.querySelectorAll(
      "input, select, textarea"
    )
    .forEach((element) => {
      const eventName =
        element.type === "checkbox" ||
        element.tagName === "SELECT"
          ? "change"
          : "input";

      element.addEventListener(
        eventName,
        () => {
          if (element.name) {
            setError(
              element.name,
              ""
            );
          }

          setStatus("");
        }
      );
    });

  /* -----------------------------------------------------
     ENVIAR FORMULARIO
  ----------------------------------------------------- */

  form?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      if (sendingForm) {
        return;
      }

      setStatus("");

      if (!validateForm()) {
        setStatus(
          "Revisa los campos indicados antes de continuar.",
          "fail"
        );

        const firstInvalid =
          form.querySelector(
            '[aria-invalid="true"]'
          );

        firstInvalid?.focus();

        return;
      }

      /* Campo oculto antispam */

      const honeypot =
        getValue("sitioWeb");

      if (honeypot) {
        form.reset();

        setStatus(
          "Tu solicitud fue recibida correctamente.",
          "ok"
        );

        return;
      }

      /* Verificar endpoint */

      if (
        !FORM_ENDPOINT ||
        FORM_ENDPOINT.includes(
          "PEGA_AQUI"
        ) ||
        !FORM_ENDPOINT.endsWith(
          "/exec"
        )
      ) {
        setStatus(
          "Falta configurar correctamente la URL de Google Apps Script.",
          "fail"
        );

        console.error(
          "FORM_ENDPOINT no está configurado correctamente."
        );

        return;
      }

      /* Datos enviados */

      const formData = {
        nombre:
          getValue("nombre"),

        email:
          getValue("email"),

        organizacion:
          getValue(
            "organizacion"
          ) || "No indicada",

        servicio:
          getValue("servicio"),

        mensaje:
          getValue("mensaje"),

        autorizacion: "Sí",

        origen:
          window.location.href,

        fechaCliente:
          new Date().toLocaleString(
            "es-CO",
            {
              timeZone:
                "America/Bogota"
            }
          )
      };

      setLoading(true);

      setStatus(
        "Enviando tu solicitud...",
        "sending"
      );

      try {
        /*
         * Google Apps Script puede bloquear la lectura
         * de la respuesta desde GitHub Pages debido a CORS.
         *
         * mode: "no-cors" permite despachar el POST.
         * En este modo no podemos leer response.json().
         */

        await fetch(
          FORM_ENDPOINT,
          {
            method: "POST",

            mode: "no-cors",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },

            body:
              JSON.stringify(
                formData
              )
          }
        );

        form.reset();

        form
          .querySelectorAll(
            ".field"
          )
          .forEach((field) => {
            field.classList.remove(
              "invalid"
            );
          });

        form
          .querySelectorAll(
            '[aria-invalid="true"]'
          )
          .forEach((element) => {
            element.setAttribute(
              "aria-invalid",
              "false"
            );
          });

        setStatus(
          "Tu solicitud fue enviada correctamente. Gracias por contactar a Senzia.",
          "ok"
        );
      } catch (error) {
        console.error(
          "Error al enviar el formulario:",
          error
        );

        setStatus(
          "No fue posible conectar con el formulario. Verifica tu conexión e inténtalo nuevamente.",
          "fail"
        );
      } finally {
        setLoading(false);
      }
    }
  );
});
