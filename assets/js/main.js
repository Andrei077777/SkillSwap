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

	/* --- Показ пароля --- */
	$$("[data-password-toggle]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const input = btn.closest(".input-wrap").querySelector("input");
			input.type = input.type === "password" ? "text" : "password";
		});
	});
})();
