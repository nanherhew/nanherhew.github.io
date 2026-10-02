/* =========================================
   NANHER HEW — ADMIN SYSTEM
========================================= */

const SUPABASE_URL =
  "https://orgrbrcfjssvdaxlxxfx.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_ZDeBcBinU4rYXPemRjO4DA_-hGWs6YH";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================
   ELEMENTS
========================================= */

const loginScreen =
  document.getElementById("loginScreen");

const adminApp =
  document.getElementById("adminApp");

const loadingScreen =
  document.getElementById("loadingScreen");

const loginForm =
  document.getElementById("loginForm");

const loginEmail =
  document.getElementById("loginEmail");

const loginPassword =
  document.getElementById("loginPassword");

const loginButton =
  document.getElementById("loginButton");

const loginError =
  document.getElementById("loginError");

const logoutButton =
  document.getElementById("logoutButton");

const adminUser =
  document.getElementById("adminUser");

const dashboardDate =
  document.getElementById("dashboardDate");

const newCount =
  document.getElementById("newCount");

const progressCount =
  document.getElementById("progressCount");

const finishedCount =
  document.getElementById("finishedCount");

const requestList =
  document.getElementById("requestList");

const requestListTitle =
  document.getElementById("requestListTitle");

const refreshButton =
  document.getElementById("refreshButton");


/* =========================================
   DETAIL
========================================= */

const detailOverlay =
  document.getElementById("detailOverlay");

const detailBackground =
  document.getElementById("detailBackground");

const detailClose =
  document.getElementById("detailClose");

const detailId =
  document.getElementById("detailId");

const detailTitle =
  document.getElementById("detailTitle");

const detailStatus =
  document.getElementById("detailStatus");

const detailName =
  document.getElementById("detailName");

const detailContactMethod =
  document.getElementById("detailContactMethod");

const detailContact =
  document.getElementById("detailContact");

const detailEmail =
  document.getElementById("detailEmail");

const detailType =
  document.getElementById("detailType");

const detailPrice =
  document.getElementById("detailPrice");

const detailDescription =
  document.getElementById("detailDescription");

const detailReferencesInput =
  document.getElementById("detailReferencesInput");

const detailReferences =
  document.getElementById("detailReferences");

const detailDate =
  document.getElementById("detailDate");

const detailNotes =
  document.getElementById("detailNotes");

const detailStatusSelect =
  document.getElementById("detailStatusSelect");

const acceptButton =
  document.getElementById("acceptButton");

const declineButton =
  document.getElementById("declineButton");

const saveButton =
  document.getElementById("saveButton");

const deleteButton =
  document.getElementById("deleteButton");

const detailMessage =
  document.getElementById("detailMessage");


/* =========================================
   VISIBILITY
========================================= */

const visibilityPrivate =
  document.getElementById("visibilityPrivate");

const visibilityPublic =
  document.getElementById("visibilityPublic");


/* =========================================
   IMAGE
========================================= */

const commissionImagePreview =
  document.getElementById(
    "commissionImagePreview"
  );

const commissionImageInput =
  document.getElementById(
    "commissionImageInput"
  );

const changeImageButton =
  document.getElementById(
    "changeImageButton"
  );

const removeImageButton =
  document.getElementById(
    "removeImageButton"
  );


/* =========================================
   DATA
========================================= */

let commissions = [];

let currentCommission = null;

let currentFilter = "new";

let currentIsPublic = false;

let currentImageUrl = null;

let imageWasRemoved = false;

let selectedImageFile = null;


const prices = {
  "Sketch": 15,
  "Headshot": 20,
  "Bust": 25,
  "Half Body": 35,
  "Full Body": 45
};


const progressStatuses = [
  "SKETCH",
  "ADJUSTING",
  "REFINING",
  "ALMOST DONE"
];


/* =========================================
   HELPERS
========================================= */

function formatPrice(type) {

  const price = prices[type];

  if (!price) {
    return "—";
  }

  return `$${price}`;
}


function formatDate(dateString) {

  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  return date.toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).toUpperCase();
}


function formatShortDate(dateString) {

  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }
  ).toUpperCase();
}


function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function getStatusClass(status) {

  if (status === "RECEIVED") {
    return "received";
  }

  if (status === "FINISHED") {
    return "finished";
  }

  return "progress";
}


/* =========================================
   DASHBOARD DATE
========================================= */

dashboardDate.textContent =
  new Date()
    .toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    )
    .toUpperCase();


/* =========================================
   AUTH
========================================= */

async function checkSession() {

  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();


  if (session) {

    showAdmin(session.user);

    await loadCommissions();

  } else {

    showLogin();

  }

  loadingScreen.classList.add("hidden");
}


function showLogin() {

  loginScreen.classList.remove("hidden");

  adminApp.classList.remove("logged-in");

}


function showAdmin(user) {

  loginScreen.classList.add("hidden");

  adminApp.classList.add("logged-in");

  adminUser.textContent =
    user.email || "";

}


loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    loginError.textContent = "";

    loginButton.disabled = true;

    loginButton.innerHTML =
      "SIGNING IN...";


    const email =
      loginEmail.value.trim();

    const password =
      loginPassword.value;


    const {
      data,
      error
    } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });


    if (error) {

      console.error(error);

      loginError.textContent =
        "Invalid email or password.";

      loginButton.disabled = false;

      loginButton.innerHTML =
        'SIGN IN <span>↗</span>';

      return;
    }


    loginForm.reset();

    showAdmin(data.user);

    await loadCommissions();

    loginButton.disabled = false;

    loginButton.innerHTML =
      'SIGN IN <span>↗</span>';

  }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
  "click",
  async () => {

    await supabaseClient.auth.signOut();

    commissions = [];

    currentCommission = null;

    closeDetail();

    showLogin();

  }
);


/* =========================================
   LOAD COMMISSIONS
========================================= */

async function loadCommissions() {

  requestList.innerHTML =
    `<div class="empty-state">
      LOADING REQUESTS...
    </div>`;


  const {
    data,
    error
  } = await supabaseClient
    .from("commissions")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(
      "Commission loading error:",
      error
    );

    requestList.innerHTML =
      `<div class="empty-state">
        COULD NOT LOAD COMMISSIONS.
      </div>`;

    return;
  }


  commissions = data || [];

  updateStats();

  renderRequests();

}


/* =========================================
   STATS
========================================= */

function updateStats() {

  const newRequests =
    commissions.filter(
      commission =>
        commission.status === "RECEIVED"
    );


  const inProgress =
    commissions.filter(
      commission =>
        progressStatuses.includes(
          commission.status
        )
    );


  const finished =
    commissions.filter(
      commission =>
        commission.status === "FINISHED"
    );


  newCount.textContent =
    String(newRequests.length)
      .padStart(2, "0");


  progressCount.textContent =
    String(inProgress.length)
      .padStart(2, "0");


  finishedCount.textContent =
    String(finished.length)
      .padStart(2, "0");

}


/* =========================================
   FILTER
========================================= */

document
  .querySelectorAll(".stat-card")
  .forEach(card => {

    card.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".stat-card")
          .forEach(
            item =>
              item.classList.remove("active")
          );


        card.classList.add("active");


        currentFilter =
          card.dataset.filter;


        renderRequests();

      }
    );

  });


function getFilteredCommissions() {

  if (currentFilter === "new") {

    return commissions.filter(
      commission =>
        commission.status === "RECEIVED"
    );

  }


  if (currentFilter === "progress") {

    return commissions.filter(
      commission =>
        progressStatuses.includes(
          commission.status
        )
    );

  }


  if (currentFilter === "finished") {

    return commissions.filter(
      commission =>
        commission.status === "FINISHED"
    );

  }


  return [];

}


/* =========================================
   RENDER REQUESTS
========================================= */

function renderRequests() {

  const filtered =
    getFilteredCommissions();


  if (currentFilter === "new") {

    requestListTitle.textContent =
      "NEW COMMISSION REQUESTS";

  }


  if (currentFilter === "progress") {

    requestListTitle.textContent =
      "COMMISSIONS IN PROGRESS";

  }


  if (currentFilter === "finished") {

    requestListTitle.textContent =
      "FINISHED COMMISSIONS";

  }


  if (!filtered.length) {

    requestList.innerHTML =
      `<div class="empty-state">
        NO COMMISSIONS IN THIS SECTION.
      </div>`;

    return;
  }


  requestList.innerHTML =
    filtered
      .map(
        (commission, index) =>
          createRequestCard(
            commission,
            index
          )
      )
      .join("");


  document
    .querySelectorAll(".request-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const id =
            Number(card.dataset.id);

          const commission =
            commissions.find(
              item =>
                item.id === id
            );

          if (commission) {

            openDetail(commission);

          }

        }
      );

    });

}


/* =========================================
   REQUEST CARD
========================================= */

function createRequestCard(
  commission,
  index
) {

  const statusClass =
    getStatusClass(
      commission.status
    );


  return `
    <article
      class="request-card"
      data-id="${commission.id}"
    >

      <div class="request-main">

        <div class="request-number">
          ${String(index + 1).padStart(3, "0")}
        </div>

        <div class="request-name">
          ${escapeHTML(commission.name)}
        </div>

        <div class="request-contact">
          ${escapeHTML(commission.contact_method)}
          /
          ${escapeHTML(commission.contact)}
        </div>

      </div>


      <div class="request-meta">

        <span class="request-type">
          ${escapeHTML(commission.commission_type)}
          /
          ${formatPrice(commission.commission_type)}
        </span>

        <span class="request-date">
          ${formatShortDate(commission.created_at)}
        </span>

        <span
          class="request-status ${statusClass}"
        >
          ${escapeHTML(commission.status)}
        </span>

      </div>

    </article>
  `;
}


/* =========================================
   OPEN DETAIL
========================================= */

function openDetail(commission) {

  currentCommission =
    commission;


  selectedImageFile = null;

  imageWasRemoved = false;


  detailId.textContent =
    String(commission.id)
      .padStart(3, "0");


  detailTitle.textContent =
    "EDIT COMMISSION";


  detailStatus.textContent =
    commission.status;


  detailStatusSelect.value =
    commission.status;


  detailName.value =
    commission.name || "";


  detailContactMethod.value =
    commission.contact_method || "Discord";


  detailContact.value =
    commission.contact || "";


  detailEmail.value =
    commission.email || "";


  detailType.value =
    commission.commission_type || "Sketch";


  detailPrice.textContent =
    formatPrice(
      commission.commission_type
    );


  detailDescription.value =
    commission.description || "";


  detailReferencesInput.value =
    commission.references_url || "";


  detailDate.textContent =
    formatDate(
      commission.created_at
    );


  detailNotes.value =
    commission.admin_notes || "";


  currentIsPublic =
    commission.is_public === true;


  updateVisibilityUI();


  currentImageUrl =
    commission.image_url || null;


  renderImagePreview();


  detailMessage.textContent =
    "";


  if (commission.status === "RECEIVED") {

    acceptButton.style.display =
      "block";

    declineButton.style.display =
      "block";

  } else {

    acceptButton.style.display =
      "none";

    declineButton.style.display =
      "none";

  }


  renderReferencePreview();


  detailOverlay.classList.add("open");

  document.body.style.overflow =
    "hidden";

}


/* =========================================
   PRICE AUTO UPDATE
========================================= */

detailType.addEventListener(
  "change",
  () => {

    detailPrice.textContent =
      formatPrice(
        detailType.value
      );

  }
);


/* =========================================
   VISIBILITY
========================================= */

function updateVisibilityUI() {

  if (
    !visibilityPrivate ||
    !visibilityPublic
  ) {
    return;
  }


  visibilityPrivate.classList.toggle(
    "active",
    !currentIsPublic
  );


  visibilityPublic.classList.toggle(
    "active",
    currentIsPublic
  );

}


visibilityPrivate.addEventListener(
  "click",
  () => {

    currentIsPublic = false;

    updateVisibilityUI();

  }
);


visibilityPublic.addEventListener(
  "click",
  () => {

    currentIsPublic = true;

    updateVisibilityUI();

  }
);


/* =========================================
   REFERENCES
========================================= */

function renderReferencePreview() {

  if (!detailReferences) {
    return;
  }


  detailReferences.innerHTML = "";


  const reference =
    detailReferencesInput.value.trim();


  if (!reference) {
    return;
  }


  let url =
    reference;


  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {

    url =
      "https://" + url;

  }


  const link =
    document.createElement("a");

  link.href =
    url;

  link.target =
    "_blank";

  link.rel =
    "noopener noreferrer";

  link.textContent =
    "OPEN REFERENCE ↗";


  detailReferences.appendChild(
    link
  );

}


detailReferencesInput.addEventListener(
  "input",
  renderReferencePreview
);


/* =========================================
   IMAGE PREVIEW
========================================= */

function renderImagePreview() {

  if (!commissionImagePreview) {
    return;
  }


  if (selectedImageFile) {

    const previewUrl =
      URL.createObjectURL(
        selectedImageFile
      );


    commissionImagePreview.innerHTML = `
      <img
        src="${previewUrl}"
        alt="Selected commission image"
      >
    `;

    return;
  }


  if (
    imageWasRemoved ||
    !currentImageUrl
  ) {

    commissionImagePreview.innerHTML = `
      <div class="commission-image-empty">
        NO IMAGE UPLOADED
      </div>
    `;

    return;
  }


  commissionImagePreview.innerHTML = `
    <img
      src="${escapeHTML(currentImageUrl)}"
      alt="Commission image"
    >
  `;

}


changeImageButton.addEventListener(
  "click",
  () => {

    commissionImageInput.click();

  }
);


commissionImageInput.addEventListener(
  "change",
  () => {

    const file =
      commissionImageInput.files[0];

    if (!file) {
      return;
    }


    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp"
      ].includes(file.type)
    ) {

      detailMessage.textContent =
        "INVALID IMAGE FORMAT.";

      commissionImageInput.value =
        "";

      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      detailMessage.textContent =
        "IMAGE MUST BE UNDER 10 MB.";

      commissionImageInput.value =
        "";

      return;
    }


    selectedImageFile =
      file;

    imageWasRemoved =
      false;

    renderImagePreview();

    detailMessage.textContent =
      "IMAGE READY. SAVE CHANGES TO UPLOAD.";

  }
);


removeImageButton.addEventListener(
  "click",
  () => {

    selectedImageFile =
      null;

    imageWasRemoved =
      true;

    commissionImageInput.value =
      "";

    renderImagePreview();

    detailMessage.textContent =
      "IMAGE WILL BE REMOVED WHEN YOU SAVE.";

  }
);


/* =========================================
   UPLOAD IMAGE
========================================= */

async function uploadCommissionImage(
  commissionId,
  file
) {

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const filePath =
    `${commissionId}-${Date.now()}.${extension}`;


  const {
    error
  } = await supabaseClient
    .storage
    .from("commission-images")
    .upload(
      filePath,
      file,
      {
        cacheControl: "3600",
        upsert: false
      }
    );


  if (error) {
    throw error;
  }


  const {
    data
  } = supabaseClient
    .storage
    .from("commission-images")
    .getPublicUrl(
      filePath
    );


  return data.publicUrl;

}


/* =========================================
   DELETE OLD IMAGE
========================================= */

async function deleteCommissionImage(
  imageUrl
) {

  if (!imageUrl) {
    return;
  }


  try {

    const marker =
      "/storage/v1/object/public/commission-images/";

    const index =
      imageUrl.indexOf(marker);


    if (index === -1) {
      return;
    }


    const filePath =
      decodeURIComponent(
        imageUrl.substring(
          index + marker.length
        )
      );


    await supabaseClient
      .storage
      .from("commission-images")
      .remove([
        filePath
      ]);

  } catch (error) {

    console.warn(
      "Could not remove old image:",
      error
    );

  }

}


/* =========================================
   CLOSE DETAIL
========================================= */

function closeDetail() {

  detailOverlay.classList.remove(
    "open"
  );

  document.body.style.overflow =
    "";

  currentCommission = null;

  selectedImageFile = null;

  imageWasRemoved = false;

  currentImageUrl = null;

}


detailClose.addEventListener(
  "click",
  closeDetail
);


detailBackground.addEventListener(
  "click",
  closeDetail
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      detailOverlay.classList.contains("open")
    ) {

      closeDetail();

    }

  }
);


/* =========================================
   ACCEPT REQUEST
========================================= */

acceptButton.addEventListener(
  "click",
  async () => {

    if (!currentCommission) {
      return;
    }


    await updateCommission(
      currentCommission.id,
      {
        status: "SKETCH"
      }
    );

  }
);


/* =========================================
   DECLINE REQUEST
========================================= */

declineButton.addEventListener(
  "click",
  async () => {

    if (!currentCommission) {
      return;
    }


    const confirmed =
      window.confirm(
        "Decline this commission request?"
      );


    if (!confirmed) {
      return;
    }


    await updateCommission(
      currentCommission.id,
      {
        status: "DECLINED"
      }
    );

  }
);


/* =========================================
   SAVE CHANGES
========================================= */

saveButton.addEventListener(
  "click",
  async () => {

    if (!currentCommission) {
      return;
    }


    saveButton.disabled =
      true;

    deleteButton.disabled =
      true;

    acceptButton.disabled =
      true;

    declineButton.disabled =
      true;


    detailMessage.textContent =
      "SAVING...";


    try {

      let newImageUrl =
        currentImageUrl;


      /* REMOVE OLD IMAGE */

      if (imageWasRemoved) {

        await deleteCommissionImage(
          currentImageUrl
        );

        newImageUrl =
          null;

      }


      /* UPLOAD NEW IMAGE */

      if (selectedImageFile) {

        const oldImageUrl =
          currentImageUrl;


        newImageUrl =
          await uploadCommissionImage(
            currentCommission.id,
            selectedImageFile
          );


        if (oldImageUrl) {

          await deleteCommissionImage(
            oldImageUrl
          );

        }

      }


      const changes = {

        name:
          detailName.value.trim(),

        contact_method:
          detailContactMethod.value,

        contact:
          detailContact.value.trim(),

        email:
          detailEmail.value.trim(),

        commission_type:
          detailType.value,

        description:
          detailDescription.value.trim(),

        references_url:
          detailReferencesInput.value.trim() ||
          null,

        status:
          detailStatusSelect.value,

        admin_notes:
          detailNotes.value.trim() ||
          null,

        is_public:
          currentIsPublic,

        image_url:
          newImageUrl

      };


      const {
        data,
        error
      } = await supabaseClient
        .from("commissions")
        .update(changes)
        .eq(
          "id",
          currentCommission.id
        )
        .select()
        .single();


      if (error) {
        throw error;
      }


      commissions =
        commissions.map(
          commission =>
            commission.id === data.id
              ? data
              : commission
        );


      currentCommission =
        data;


      currentImageUrl =
        data.image_url || null;

      selectedImageFile =
        null;

      imageWasRemoved =
        false;

      commissionImageInput.value =
        "";

      updateStats();

      renderRequests();

      detailStatus.textContent =
        data.status;

      detailStatusSelect.value =
        data.status;

      detailPrice.textContent =
        formatPrice(
          data.commission_type
        );

      currentIsPublic =
        data.is_public === true;

      updateVisibilityUI();

      renderImagePreview();

      renderReferencePreview();


      if (
        data.status === "RECEIVED"
      ) {

        acceptButton.style.display =
          "block";

        declineButton.style.display =
          "block";

      } else {

        acceptButton.style.display =
          "none";

        declineButton.style.display =
          "none";

      }


      detailMessage.textContent =
        "CHANGES SAVED.";

    } catch (error) {

      console.error(
        "Commission save error:",
        error
      );

      detailMessage.textContent =
        "COULD NOT SAVE CHANGES.";

    }


    saveButton.disabled =
      false;

    deleteButton.disabled =
      false;

    acceptButton.disabled =
      false;

    declineButton.disabled =
      false;

  }
);


/* =========================================
   DELETE COMMISSION
========================================= */

deleteButton.addEventListener(
  "click",
  async () => {

    if (!currentCommission) {
      return;
    }


    const confirmed =
      window.confirm(
        "DELETE THIS COMMISSION?\n\nThis action cannot be undone."
      );


    if (!confirmed) {
      return;
    }


    deleteButton.disabled =
      true;

    saveButton.disabled =
      true;

    detailMessage.textContent =
      "DELETING...";


    try {

      if (currentCommission.image_url) {

        await deleteCommissionImage(
          currentCommission.image_url
        );

      }


      const {
        error
      } = await supabaseClient
        .from("commissions")
        .delete()
        .eq(
          "id",
          currentCommission.id
        );


      if (error) {
        throw error;
      }


      commissions =
        commissions.filter(
          commission =>
            commission.id !==
            currentCommission.id
        );


      updateStats();

      renderRequests();

      closeDetail();

    } catch (error) {

      console.error(
        "Commission delete error:",
        error
      );

      detailMessage.textContent =
        "COULD NOT DELETE COMMISSION.";

      deleteButton.disabled =
        false;

      saveButton.disabled =
        false;

    }

  }
);


/* =========================================
   REFRESH
========================================= */

refreshButton.addEventListener(
  "click",
  async () => {

    refreshButton.disabled =
      true;

    refreshButton.textContent =
      "REFRESHING...";


    await loadCommissions();


    refreshButton.disabled =
      false;

    refreshButton.textContent =
      "REFRESH ↻";

  }
);


/* =========================================
   AUTH STATE
========================================= */

supabaseClient.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    if (event === "SIGNED_OUT") {

      showLogin();

      return;

    }


    if (
      event === "SIGNED_IN" &&
      session
    ) {

      showAdmin(
        session.user
      );

    }

  }
);


/* =========================================
   START
========================================= */

checkSession();
