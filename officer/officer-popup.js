/* =========================================================
   DOMINEXUS OFFICER CUSTOM POPUP
========================================================= */

function createDominexusPopup() {

    if (
        document.getElementById(
            "dominexusPopupOverlay"
        )
    ) {
        return;
    }


    const popupHTML = `

        <div
            id="dominexusPopupOverlay"
            class="dominexus-popup-overlay"
        >

            <div
                id="dominexusPopup"
                class="dominexus-popup"
            >

                <div
                    id="dominexusPopupIcon"
                    class="dominexus-popup-icon"
                >
                    i
                </div>


                <div
                    id="dominexusPopupTitle"
                    class="dominexus-popup-title"
                >
                    Notice
                </div>


                <div
                    id="dominexusPopupMessage"
                    class="dominexus-popup-message"
                >
                    Message
                </div>


                <div
                    id="dominexusPopupInputContainer"
                    style="display:none;"
                >

                    <input
                        id="dominexusPopupInput"
                        class="dominexus-popup-input"
                        type="text"
                    >

                </div>


                <div
                    id="dominexusPopupActions"
                    class="dominexus-popup-actions"
                >

                    <button
                        id="dominexusPopupCancel"
                        class="dominexus-popup-button cancel"
                        type="button"
                    >
                        Cancel
                    </button>


                    <button
                        id="dominexusPopupConfirm"
                        class="dominexus-popup-button primary"
                        type="button"
                    >
                        OK
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.insertAdjacentHTML(
        "beforeend",
        popupHTML
    );

}


/* =========================================================
   SHOW POPUP
========================================================= */

function showDominexusPopup(
    title,
    message,
    type = "info",
    onConfirm = null
) {

    createDominexusPopup();


    const overlay =
        document.getElementById(
            "dominexusPopupOverlay"
        );

    const popup =
        document.getElementById(
            "dominexusPopup"
        );

    const icon =
        document.getElementById(
            "dominexusPopupIcon"
        );

    const titleElement =
        document.getElementById(
            "dominexusPopupTitle"
        );

    const messageElement =
        document.getElementById(
            "dominexusPopupMessage"
        );

    const cancelButton =
        document.getElementById(
            "dominexusPopupCancel"
        );

    const confirmButton =
        document.getElementById(
            "dominexusPopupConfirm"
        );


    popup.className =
        "dominexus-popup " +
        type;


    if (type === "success") {

        icon.textContent = "✓";

    } else if (type === "error") {

        icon.textContent = "!";

    } else if (type === "warning") {

        icon.textContent = "?";

    } else {

        icon.textContent = "i";

    }


    titleElement.textContent =
        title;


    messageElement.textContent =
        message;


    cancelButton.style.display =
        onConfirm
            ? "flex"
            : "none";


    confirmButton.textContent =
        onConfirm
            ? "Confirm"
            : "OK";


    confirmButton.onclick =
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            closeDominexusPopup();


            if (onConfirm) {

                onConfirm();

            }

        };


    cancelButton.onclick =
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            closeDominexusPopup();

        };


    overlay.onclick =
        function(event) {

            if (
                event.target ===
                overlay
            ) {

                closeDominexusPopup();

            }

        };


    overlay.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE POPUP
========================================================= */

function closeDominexusPopup() {

    const overlay =
        document.getElementById(
            "dominexusPopupOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.remove(
        "show"
    );

}