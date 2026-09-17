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

	document.addEventListener("click", () => closeAllSelects(null));

	/* --- Лайки --- */
	$$(".card__like").forEach((btn) => {
		btn.addEventListener("click", () => {
			const active = btn.classList.toggle("is-active");
			const use = btn.querySelector("use");
			if (use) use.setAttribute("href", `assets/svg/sprite.svg#i-like${active ? "-fill" : ""}`);
			btn.setAttribute("aria-label", active ? "Убрать из избранного" : "В избранное");
		});
	});

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
})();
