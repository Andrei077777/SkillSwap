/* Интерактив SkillSwap */
(() => {
	"use strict";

	const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

	/* --- Тема --- */
	const THEME_KEY = "skillswap-theme";
	const applyTheme = (theme) => {
		document.documentElement.dataset.theme = theme;
		$$("[data-theme-toggle] use").forEach((use) => {
			use.setAttribute("href", `assets/svg/sprite.svg#i-${theme === "dark" ? "sun" : "moon"}`);
		});
	};

	let saved = null;
	try {
		saved = localStorage.getItem(THEME_KEY);
	} catch {
		/* приватный режим */
	}
	if (saved) applyTheme(saved);

	$$("[data-theme-toggle]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
			applyTheme(next);
			try {
				localStorage.setItem(THEME_KEY, next);
			} catch {
				/* не критично */
			}
		});
	});

	/* --- Фильтры на мобильном --- */
	$$("[data-filters-toggle]").forEach((btn) => {
		const panel = document.getElementById(btn.getAttribute("aria-controls"));
		if (!panel) return;
		btn.addEventListener("click", () => {
			const open = btn.getAttribute("aria-expanded") === "true";
			btn.setAttribute("aria-expanded", String(!open));
			panel.classList.toggle("is-collapsed", open);
		});
	});

	/* --- Селекты --- */
	$$(".select__value.select__placeholder").forEach((v) => {
		v.dataset.placeholder = v.textContent.trim();
	});

	const closeAllSelects = (except) => {
		$$('.select__toggle[aria-expanded="true"]').forEach((t) => {
			if (t !== except) t.setAttribute("aria-expanded", "false");
		});
	};

	$$(".select__toggle").forEach((toggle) => {
		toggle.addEventListener("click", (e) => {
			e.stopPropagation();
			const open = toggle.getAttribute("aria-expanded") === "true";
			closeAllSelects(toggle);
			toggle.setAttribute("aria-expanded", String(!open));
		});
	});

	// Выбор варианта в одиночном селекте
	$$(".select__menu").forEach((menu) => {
		menu.addEventListener("click", (e) => {
			const option = e.target.closest(".select__option");

			if (option && option.querySelector("input")) {
				e.stopPropagation();
				const select = menu.closest(".select");
				const toggle = select.querySelector(".select__toggle");
				const value = toggle.querySelector(".select__value");
				setTimeout(() => {
					const checked = $$("input:checked", menu);
					option.classList.toggle("is-selected", option.querySelector("input").checked);
					if (!value) return;
					if (!checked.length) {
						value.textContent = value.dataset.placeholder || "Выберите";
						value.classList.add("select__placeholder");
					} else if (checked.length === 1) {
						value.textContent = checked[0].closest(".check").querySelector(".check__text").textContent;
						value.classList.remove("select__placeholder");
					} else {
						value.textContent = `Выбрано: ${checked.length}`;
						value.classList.remove("select__placeholder");
					}
				}, 0);
				return;
			}

			if (!option) return;
			const select = menu.closest(".select");
			const toggle = select.querySelector(".select__toggle");
			const value = toggle.querySelector(".select__value");
			if (value) {
				value.textContent = option.textContent.trim();
				value.classList.remove("select__placeholder");
			}
			$$(".select__option", menu).forEach((o) => o.classList.remove("is-selected"));
			option.classList.add("is-selected");
			toggle.setAttribute("aria-expanded", "false");
		});
	});

	/* --- Попоуверы шапки --- */
	const closeAllPopovers = (except) => {
		$$(".header__popover").forEach((p) => {
			if (p !== except) {
				p.hidden = true;
				const owner = document.querySelector(`[aria-controls="${p.id}"]`);
				if (owner) owner.setAttribute("aria-expanded", "false");
			}
		});
	};

	$$("[data-popover-toggle]").forEach((btn) => {
		const panel = document.getElementById(btn.getAttribute("aria-controls"));
		if (!panel) return;
		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			const open = btn.getAttribute("aria-expanded") === "true";
			closeAllPopovers(open ? null : panel);
			btn.setAttribute("aria-expanded", String(!open));
			panel.hidden = open;
		});
	});

	document.addEventListener("click", () => {
		closeAllSelects(null);
		closeAllPopovers(null);
	});

	document.addEventListener("keydown", (e) => {
		if (e.key !== "Escape") return;
		closeAllSelects(null);
		closeAllPopovers(null);
		$$(".modal-backdrop:not([hidden])").forEach((m) => {
			m.hidden = true;
		});
	});

	/* --- Уведомления --- */
	$$(".notifications").forEach((panel) => {
		const newSection = panel.querySelector("[data-notif-new]");
		const seenSection = panel.querySelector("[data-notif-seen]");
		const bell = document.querySelector(`[aria-controls="${panel.id}"]`);

		const emptyText = (section, text) => {
			const list = section.querySelector(".notifications__list");
			if (!list || list.children.length) return;
			const p = document.createElement("p");
			p.className = "notifications__empty";
			p.textContent = text;
			list.replaceWith(p);
		};

		panel.querySelector("[data-notif-read-all]")?.addEventListener("click", () => {
			const from = newSection?.querySelector(".notifications__list");
			const to = seenSection?.querySelector(".notifications__list");
			if (from && to) {
				[...from.children].forEach((item) => {
					item.classList.add("notif--seen");
					item.querySelector(".notif__go")?.remove();
					to.prepend(item);
				});
			}
			bell?.classList.remove("has-badge");
			if (newSection) emptyText(newSection, "Новых уведомлений нет");
		});

		panel.querySelector("[data-notif-clear]")?.addEventListener("click", () => {
			const list = seenSection?.querySelector(".notifications__list");
			if (list) list.innerHTML = "";
			if (seenSection) emptyText(seenSection, "Список пуст");
		});
	});

	/* --- Лайки --- */
	$$(".card__like, [data-like]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const active = btn.classList.toggle("is-active");
			const use = btn.querySelector("use");
			if (use) use.setAttribute("href", `assets/svg/sprite.svg#i-like${active ? "-fill" : ""}`);
			btn.setAttribute("aria-label", active ? "Убрать из избранного" : "В избранное");
		});
	});

	/* --- Тосты --- */
	const SPRITE = "assets/svg/sprite.svg";

	const hideToast = (toast) => {
		if (!toast || toast.classList.contains("is-leaving")) return;
		toast.classList.add("is-leaving");
		toast.addEventListener("animationend", () => toast.remove(), { once: true });
		setTimeout(() => toast.remove(), 400);
	};

	document.addEventListener("click", (e) => {
		const btn = e.target.closest("[data-toast-close]");
		if (btn) hideToast(btn.closest(".toast"));
	});

	const showToast = ({ text = "", action = null, href = "#", timeout = 0 } = {}) => {
		const stack = document.querySelector(".toasts");
		if (!stack) return null;

		const toast = document.createElement("div");
		toast.className = "toast" + (action ? " toast--action" : "");
		toast.setAttribute("role", "status");
		toast.innerHTML = '<svg class="icon toast__icon" aria-hidden="true"><use href="' + SPRITE + '#i-idea"></use></svg>' + '<span class="toast__text"></span>' + '<button class="toast__close" type="button" data-toast-close aria-label="Скрыть">' + '<svg class="icon" aria-hidden="true"><use href="' + SPRITE + '#i-cross"></use></svg>' + "</button>" + (action ? '<a class="btn toast__go" href="' + href + '"></a>' : "");

		toast.querySelector(".toast__text").textContent = text;
		if (action) toast.querySelector(".toast__go").textContent = action;

		stack.appendChild(toast);
		if (timeout > 0) setTimeout(() => hideToast(toast), timeout);
		return toast;
	};

	window.SkillSwap = Object.assign(window.SkillSwap || {}, { showToast, hideToast });

	/* --- Проверка формы входа --- */
	$$("[data-login-form]").forEach((form) => {
		const email = form.querySelector("#email");
		const pass = form.querySelector("#password");
		const error = form.querySelector("#login-error");
		if (!email || !pass || !error) return;

		const wrap = (input) => input.closest(".input-wrap");

		const clear = () => {
			error.hidden = true;
			[email, pass].forEach((i) => {
				wrap(i).classList.remove("is-error");
				i.removeAttribute("aria-invalid");
			});
		};

		const fail = () => {
			error.hidden = false;
			[email, pass].forEach((i) => {
				wrap(i).classList.add("is-error");
				i.setAttribute("aria-invalid", "true");
			});
			email.setAttribute("aria-describedby", "login-error");
			pass.setAttribute("aria-describedby", "login-error");
		};

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			fail();
		});

		[email, pass].forEach((i) => i.addEventListener("input", clear));
	});

	/* --- Модалки --- */
	$$("[data-modal-open]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const modal = document.getElementById(btn.dataset.modalOpen);
			if (modal) modal.hidden = false;
		});
	});

	$$("[data-modal-close]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const modal = btn.closest(".modal-backdrop");
			if (modal) modal.hidden = true;
		});
	});

	$$(".modal-backdrop").forEach((backdrop) => {
		backdrop.addEventListener("click", (e) => {
			if (e.target === backdrop) backdrop.hidden = true;
		});
	});

	/* --- Показ пароля --- */
	$$("[data-password-toggle]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const input = btn.closest(".input-wrap").querySelector("input");
			const shown = input.type === "text";
			input.type = shown ? "password" : "text";
			const use = btn.querySelector("use");
			if (use) use.setAttribute("href", `assets/svg/sprite.svg#i-eye${shown ? "" : "-slash"}`);
			btn.setAttribute("aria-label", shown ? "Показать пароль" : "Скрыть пароль");
		});
	});

	/* --- Очистка поля поиска --- */
	$$("[data-search-clear]").forEach((btn) => {
		const input = btn.closest(".input-wrap").querySelector("input");
		if (!input) return;
		const sync = () => {
			btn.hidden = !input.value;
		};
		sync();
		input.addEventListener("input", sync);
		btn.addEventListener("click", () => {
			input.value = "";
			sync();
			input.focus();
		});
	});

	/* --- Календарь --- */
	const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
	const DOW = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
	const pad = (n) => String(n).padStart(2, "0");

	const parseDate = (str) => {
		const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((str || "").trim());
		if (!m) return null;
		const [, d, mo, y] = m.map(Number);
		const date = new Date(y, mo - 1, d);
		return date.getDate() === d && date.getMonth() === mo - 1 ? date : null;
	};

	$$("[data-datepicker]").forEach((wrap) => {
		const input = wrap.querySelector("input");
		const toggle = wrap.querySelector("[data-calendar-toggle]");
		if (!input || !toggle) return;

		const cal = document.createElement("div");
		cal.className = "calendar";
		cal.hidden = true;
		wrap.appendChild(cal);

		const thisYear = new Date().getFullYear();
		const years = [];
		for (let y = thisYear - 14; y >= thisYear - 100; y--) years.push(y);

		let view = parseDate(input.value) || new Date(thisYear - 25, 0, 1);
		let picked = parseDate(input.value);

		const render = () => {
			const year = view.getFullYear();
			const month = view.getMonth();
			const first = new Date(year, month, 1);
			const shift = (first.getDay() + 6) % 7;
			const start = new Date(year, month, 1 - shift);

			const cells = [];
			for (let i = 0; i < 42; i++) {
				const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
				const muted = day.getMonth() !== month;
				const sel = picked && day.toDateString() === picked.toDateString();
				cells.push(`<button type="button" class="calendar__day${muted ? " is-muted" : ""}${sel ? " is-selected" : ""}" ` + `data-date="${pad(day.getDate())}.${pad(day.getMonth() + 1)}.${day.getFullYear()}">${day.getDate()}</button>`);
			}

			cal.innerHTML =
				'<div class="calendar__head">' +
				'<span class="calendar__nav"><select data-month aria-label="Месяц">' +
				MONTHS.map((m, i) => `<option value="${i}"${i === month ? " selected" : ""}>${m}</option>`).join("") +
				'</select><svg class="icon" aria-hidden="true"><use href="assets/svg/sprite.svg#i-chevron-down"></use></svg></span>' +
				'<span class="calendar__nav"><select data-year aria-label="Год">' +
				years.map((y) => `<option value="${y}"${y === year ? " selected" : ""}>${y}</option>`).join("") +
				'</select><svg class="icon" aria-hidden="true"><use href="assets/svg/sprite.svg#i-chevron-down"></use></svg></span>' +
				"</div>" +
				'<div class="calendar__grid">' +
				DOW.map((d) => `<span class="calendar__dow">${d}</span>`).join("") +
				cells.join("") +
				"</div>" +
				'<div class="calendar__actions">' +
				'<button class="btn btn--secondary" type="button" data-cal-cancel>Отменить</button>' +
				'<button class="btn btn--primary" type="button" data-cal-apply>Выбрать</button>' +
				"</div>";
		};

		const open = () => {
			render();
			cal.hidden = false;
			toggle.setAttribute("aria-expanded", "true");
		};
		const close = () => {
			cal.hidden = true;
			toggle.setAttribute("aria-expanded", "false");
		};

		toggle.addEventListener("click", (e) => {
			e.stopPropagation();
			cal.hidden ? open() : close();
		});

		cal.addEventListener("click", (e) => {
			e.stopPropagation();
			const day = e.target.closest(".calendar__day");
			if (day) {
				picked = parseDate(day.dataset.date);
				view = new Date(picked);
				render();
				return;
			}
			if (e.target.closest("[data-cal-cancel]")) {
				close();
				return;
			}
			if (e.target.closest("[data-cal-apply]")) {
				if (picked) input.value = `${pad(picked.getDate())}.${pad(picked.getMonth() + 1)}.${picked.getFullYear()}`;
				close();
			}
		});

		cal.addEventListener("change", (e) => {
			const month = cal.querySelector("[data-month]");
			const year = cal.querySelector("[data-year]");
			if (e.target === month || e.target === year) {
				view = new Date(Number(year.value), Number(month.value), 1);
				render();
			}
		});

		input.addEventListener("change", () => {
			const d = parseDate(input.value);
			if (d) {
				picked = d;
				view = new Date(d);
			}
		});

		document.addEventListener("click", () => {
			if (!cal.hidden) close();
		});
	});

	/* --- Галерея --- */
	$$("[data-gallery]").forEach((gallery) => {
		const main = gallery.querySelector(".gallery__main > img, .gallery__main > .photo-ph");
		$$(".gallery__thumb", gallery).forEach((thumb) => {
			thumb.addEventListener("click", () => {
				if (!main) return;
				const thumbImg = thumb.querySelector("img");
				if (thumbImg && main.tagName === "IMG") {
					const prev = main.src;
					main.src = thumbImg.src;
					thumbImg.src = prev;
				} else {
					// заглушки: меняем классы-градиенты местами
					const inner = thumb.firstElementChild || thumb;
					const a = [...main.classList].find((c) => c.startsWith("photo-ph--"));
					const b = [...inner.classList].find((c) => c.startsWith("photo-ph--"));
					if (a) main.classList.remove(a);
					if (b) {
						inner.classList.remove(b);
						main.classList.add(b);
					}
					if (a) inner.classList.add(a);
				}
			});
		});
	});
})();
