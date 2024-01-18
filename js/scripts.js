// Seleção de elementos
const titleForm = document.querySelector("#title-form")
const titleInput = document.querySelector("#title-input")
const seriesList = document.querySelector("#series-list")
const editForm = document.querySelector("#edit-form")
const editInput = document.querySelector("#edit-input")
const cancelEditBtn = document.querySelector("#cancel-edit-btn")
const searchInput = document.querySelector("#search-input")
const eraseBtn = document.querySelector("#erase-button")
const filterBtn = document.querySelector("#filter-select")
const existMessage = document.querySelector(".exist-message")
const closeMessageBtn = document.querySelector("#close-message-btn")
let oldInputValue;












/////////////////// Funções ///////////////////////////////////////////////



const renderItens = (titulo, classe = ["tostart"], season = "T1", epiIni = "", epiTot = "") => {

    if (!titulo) {
        return;
    }

    const serie = document.createElement("div")
    serie.classList.add("serie")
    serie.classList.add(...classe)
    seriesList.appendChild(serie)

    const serieTitle = document.createElement("h3")
    serieTitle.innerText = titulo
    serie.appendChild(serieTitle)

    const infos = document.createElement("div")
    infos.classList.add("serie-info")
    serie.appendChild(infos)

    const episodes = document.createElement("div")
    episodes.classList.add("episodes")
    infos.appendChild(episodes)

    const seasons = document.createElement("div")
    seasons.classList.add("seasons")
    infos.appendChild(seasons)

    const conclusion = document.createElement("div")
    conclusion.classList.add("conclusion")
    infos.appendChild(conclusion)

    const doneBtn = document.createElement("button")
    doneBtn.classList.add("finish-serie")
    doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>'
    conclusion.appendChild(doneBtn)

    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add("remove-serie")
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>'
    conclusion.appendChild(deleteBtn)

    const tempForward = document.createElement("button")
    tempForward.classList.add("add-season")
    tempForward.innerHTML = '<i class="fa-solid fa-forward"></i>'
    seasons.appendChild(tempForward)

    const tempBackward = document.createElement("button")
    tempBackward.classList.add("remove-season")
    tempBackward.innerHTML = '<i class="fa-solid fa-backward"></i>'
    seasons.appendChild(tempBackward)

    const serieTemp = document.createElement("h4")
    serieTemp.innerText = season
    episodes.appendChild(serieTemp)

    const epis = document.createElement("div")
    epis.classList.add("epis")
    episodes.appendChild(epis)
    epis.innerHTML = '<input type="number" class="epi-atual"><span> / </span><input type="number" class="epi-total">'

    epis.querySelector(".epi-atual").value = epiIni
    epis.querySelector(".epi-total").value = epiTot

}

const getSearchItens = (search) => {
    const itens = document.querySelectorAll(".serie")

    itens.forEach((item) => {
        let itemTitle = item.querySelector("h3").innerText.toLowerCase()

        const normalizedSearch = search.toLowerCase()

        item.style.display = "flex"

        if (!itemTitle.includes(normalizedSearch)) {
            item.style.display = "none"
        }
    })
}


const filterItens = (filterValue) => {
    const itens = document.querySelectorAll(".serie")

    switch (filterValue) {
        case "all":
            itens.forEach((item) => item.style.display = "flex")
            break

        case "done":
            itens.forEach((item) => item.classList.contains("done") ? item.style.display = "flex" : item.style.display = "none")
            break
        case "tostart":
            itens.forEach((item) => item.classList.contains("tostart") && !item.classList.contains("done") ? item.style.display = "flex" : item.style.display = "none")
            break
        case "started":
            itens.forEach((item) => item.classList.contains("started") && !item.classList.contains("done") ? item.style.display = "flex" : item.style.display = "none")
            break
        case "hold":
            itens.forEach((item) => item.classList.contains("hold") && !item.classList.contains("done") ? item.style.display = "flex" : item.style.display = "none")
            break
        default: ;
            break;
    }
}













///////////////////// Eventos //////////////////////////////////////////////
titleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputValue = titleInput.value

    if (inputValue) {
        const itens = document.querySelectorAll(".serie")
        const isThere = []

        itens.forEach((item) => {
            let itemTitle = item.querySelector("h3").innerText.toLowerCase()

            if (itemTitle === inputValue.toLowerCase()) {
                isThere.push(itemTitle)
            }
        })

        if (isThere.length === 0) {
            saveNewItem(inputValue)

        } else {
            existMessage.classList.toggle("hide")
            seriesList.classList.toggle("hide")
        }


    }

})


closeMessageBtn.addEventListener("click", (e) => {
    existMessage.classList.toggle("hide")
    seriesList.classList.toggle("hide")
})


document.addEventListener("click", (e) => {
    const targetEl = e.target
    const parentEl = targetEl.parentElement.parentElement.parentElement

    let seriesSaved = getItensLocalStorage()

    let itemTitle;

    if (parentEl && parentEl.querySelector("h3")) {
        itemTitle = parentEl.querySelector("h3").innerText
    }


    if (targetEl.classList.contains("finish-serie")) {

        parentEl.classList.toggle("done")

        seriesSaved.forEach((obj) => {
            if (obj.text === itemTitle) {
                obj.classe.includes("done") ? obj.classe.pop() : obj.classe.push("done")
            }
        })
    }

    if (targetEl.classList.contains("remove-serie")) {

        const filtered = seriesSaved.filter((obj) => {
            return obj.text !== parentEl.querySelector("h3").innerText
        })

        seriesSaved = [...filtered]

        seriesList.removeChild(parentEl)
    }

    if (targetEl.classList.contains("add-season")) {
        let seasonAtual = +parentEl.querySelector(".episodes h4").innerText.split("T")[1];
        seasonAtual += 1;

        // mudar season no array
        seriesSaved.forEach((obj) => {
            if (obj.text === itemTitle) {
                obj.season = `T${seasonAtual}`
            }
        })

        if (seasonAtual > 1) {
            parentEl.classList.remove("tostart")
            parentEl.classList.remove("hold")
            parentEl.classList.add("started")

            seriesSaved.forEach((obj) => {
                if (obj.text === itemTitle) {
                    obj.classe = ["started"]
                }
            })

            parentEl.querySelector(".episodes .epis .epi-atual").value = "0"
        }
        parentEl.querySelector(".episodes h4").innerText = `T${seasonAtual}`;
    }

    if (targetEl.classList.contains("remove-season")) {
        let seasonAtual = +parentEl.querySelector(".episodes h4").innerText.split("T")[1];
        seasonAtual -= 1;

        // mudar season no array
        seriesSaved.forEach((obj) => {
            if (obj.text === itemTitle) {
                obj.season = `T${seasonAtual}`
            }
        })

        if (+parentEl.querySelector(".episodes .epis .epi-atual").value < 1) {
            parentEl.classList.remove("started")
            parentEl.classList.add("tostart")

            seriesSaved.forEach((obj) => {
                if (obj.text === itemTitle) {
                    obj.classe = ["tostart"]
                }
            })
        }
        parentEl.querySelector(".episodes h4").innerText = `T${seasonAtual}`;
    }
    localStorage.setItem("series", JSON.stringify(seriesSaved))
})


// evento de change apenas para mudar episódio atual e final
seriesList.addEventListener("change", (e) => {
    const targetEl = e.target

    const parentEl = targetEl.parentElement.parentElement.parentElement.parentElement

    const titleTemp = parentEl.querySelector("h3").innerText

    const seriesSaved = getItensLocalStorage()

    seriesSaved.forEach((obj) => {
        if (obj.text === titleTemp) {
            obj.epiIni = parentEl.querySelector(".episodes .epis .epi-atual").value
            obj.epiTot = parentEl.querySelector(".episodes .epis .epi-total").value
        }
    })


    if (parentEl.classList.contains("serie")) {
        if (+parentEl.querySelector(".episodes .epis .epi-atual").value === +parentEl.querySelector(".episodes .epis .epi-total").value &&
            +parentEl.querySelector(".episodes .epis .epi-total").value !== 0) {
            parentEl.classList.remove("tostart")
            parentEl.classList.remove("started")
            parentEl.classList.add("hold")

            // muda para hold no array
            seriesSaved.forEach((obj) => {
                if (obj.text === titleTemp) {
                    obj.classe = ["hold"]
                }
            })
        } else {
            if (+parentEl.querySelector(".episodes .epis .epi-atual").value > 0) {
                parentEl.classList.remove("hold")
                parentEl.classList.remove("tostart")
                parentEl.classList.add("started")

                // muda para started no array
                seriesSaved.forEach((obj) => {
                    if (obj.text === titleTemp) {
                        obj.classe = ["started"]
                    }
                })
            } else {
                if (parentEl.querySelector(".episodes h4").innerText === "T1") {
                    parentEl.classList.remove("hold")
                    parentEl.classList.remove("started")
                    parentEl.classList.add("tostart")

                    // muda para tostart no array
                    seriesSaved.forEach((obj) => {
                        if (obj.text === titleTemp) {
                            obj.classe = ["tostart"]
                        }
                    })
                }
            }
        }
    }

    // salva as mudanças no storage
    localStorage.setItem("series", JSON.stringify(seriesSaved))

})


searchInput.addEventListener("keyup", (e) => {
    const search = e.target.value

    getSearchItens(search)

})

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault()
    searchInput.value = ""

    searchInput.dispatchEvent(new Event("keyup"))
})

filterBtn.addEventListener("change", (e) => {
    const filterValue = e.target.value

    filterItens(filterValue)
})













/////////// Local Storage //////////////////////////////////////////////////////////////

function getItensLocalStorage() {
    const seriesSaved = JSON.parse(localStorage.getItem("series")) || []

    return seriesSaved
}



function saveNewItem(name) {

    const blankItem = {
        "text": name,
        "classe": ["tostart"],
        "season": "T1",
        "epiIni": "",
        "epiTot": ""
    }

    const seriesSaved = getItensLocalStorage()

    seriesSaved.push(blankItem)

    localStorage.setItem("series", JSON.stringify(seriesSaved))

    loadItens()

}




function loadItens() {

    const seriesSaved = getItensLocalStorage()

    while (seriesList.firstChild) {
        seriesList.removeChild(seriesList.lastChild)
    }

    seriesSaved.forEach((obj) => {
        renderItens(obj.text, obj.classe, obj.season, obj.epiIni, obj.epiTot)
    })

}


loadItens()

// DADOS PARA SALVAR:
// text:
// classe: []
// season:
// epiIni:
// epiTot:
