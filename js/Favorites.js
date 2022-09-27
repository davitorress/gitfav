import { GithubUser } from "./GithubUser.js";

export class Favorites {
	constructor(root) {
		this.root = document.querySelector(root);
		this.load();
	}

	load() {
		this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
	}

	save() {
		localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
	}

	async add(username) {
		try {
			const userExists = this.entries.find((entry) => entry.login === username);

			if (userExists) {
				throw new Error("Usuário já cadastrado!");
			}

			const user = await GithubUser.search(username);

			if (user.login === undefined) {
				throw new Error("Usuário não encontrado!");
			}

			this.entries = [user, ...this.entries];
			this.update();
		} catch (error) {
			alert(error.message);
		}
	}

	delete(user) {
		const filteredEntries = this.entries.filter((entry) => user.login !== entry.login);

		this.entries = filteredEntries;
		this.update();
		this.save();
	}
}

export class FavoritesView extends Favorites {
	constructor(root) {
		super(root);

		this.tbody = this.root.querySelector("table tbody");

		this.update();
		this.onAdd();
	}

	hasFavorites() {
		const tfoot = this.root.querySelector("tfoot");
		this.entries.length === 0 ? tfoot.classList.remove("hide") : tfoot.classList.add("hide");
	}

	onAdd() {
		const addButton = this.root.querySelector(".search button");

		addButton.addEventListener("click", () => {
			const { value } = this.root.querySelector(".search input");
			this.root.querySelector(".search input").value = "";

			this.add(value);
		});
	}

	update() {
		this.removeAllTr();

		this.entries.forEach((user) => {
			const row = this.createRow();

			row.querySelector(".user img").src = `https://github.com/${user.login}.png`;
			row.querySelector(".user img").alt = `Imagem de ${user.name}`;
			row.querySelector(".user a").href = `https://github.com/${user.login}`;
			row.querySelector(".user p").textContent = user.name;
			row.querySelector(".user span").textContent = `/${user.login}`;
			row.querySelector(".repositories p").textContent = user.public_repos;
			row.querySelector(".followers p").textContent = user.followers;

			row.querySelector(".action button").addEventListener("click", () => {
				const isOk = confirm("Tem certeza que deseja deletar essa linha?");
				if (isOk) {
					this.delete(user);
				}
			});

			this.tbody.append(row);
		});

		this.hasFavorites();
	}

	createRow() {
		const tr = document.createElement("tr");

		tr.innerHTML = `
			<td class="user">
				<img src="https://github.com/davitorress.png" alt="Imagem de Davi Torres" />

				<a href="https://github.com/davitorress" target="_blank">
					<p>Davi Torres</p>
					<span>/davitorress</span>
				</a>
			</td>
			<td class="repositories">
				<p>123</p>
			</td>
			<td class="followers">
				<p>1234</p>
			</td>
			<td class="action">
				<button>Remover</button>
			</td>
		`;

		return tr;
	}

	removeAllTr() {
		this.tbody.querySelectorAll("tr").forEach((tr) => {
			tr.remove();
		});
	}
}
