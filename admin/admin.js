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


/* DETAIL */

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

const detailMessage =
  document.getElementById("detailMessage");

const visibilityPrivate =
  document.getElementById("visibilityPrivate");

const visibilityPublic =
  document.getElementById("visibilityPublic");

/* =========================================
   DATA
========================================= */

let commissions = [];

let currentCommission = null;

let currentFilter = "new";

let currentIsPublic = false;

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

  if (value === null || value === undefined) {
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


  detailId.textContent =
    String(commission.id)
      .padStart(3, "0");


  detailTitle.textContent =
    "REQUEST";


  detailStatus.textContent =
    commission.status;


  detailStatusSelect.value =
    commission.status;


  detailName.textContent =
    commission.name || "—";


  detailContact.textContent =
    `${commission.contact_method || "—"} / ${commission.contact || "—"}`;


  detailEmail.textContent =
    commission.email || "—";


  detailType.textContent =
    commission.commission_type || "—";


  detailPrice.textContent =
    formatPrice(
      commission.commission_type
    );


  detailDescription.textContent =
    commission.description || "—";


  detailDate.textContent =
    formatDate(
      commission.created_at
    );


  detailNotes.value =
    commission.admin_notes || "";

currentIsPublic =
  commission.is_public === true;

updateVisibilityUI();
   
  renderReferences(
    commission.references_url
  );


  detailMessage.textContent =
    "";


  /*
    ACCEPT only makes sense for
    a newly received request.
  */

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


  detailOverlay.classList.add("open");

  document.body.style.overflow =
    "hidden";

}

function updateVisibilityUI() {

  if (!visibilityPrivate || !visibilityPublic) {
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

function renderReferences(reference) {

  detailReferences.innerHTML = "";


  if (!reference) {

    detailReferences.textContent =
      "NO REFERENCES PROVIDED.";

    return;
  }


  const trimmed =
    reference.trim();


  let url = trimmed;


  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {

    url =
      "https://" + url;

  }


  const link =
    document.createElement("a");

  link.href = url;

  link.target = "_blank";

  link.rel = "noopener noreferrer";

  link.textContent = trimmed;


  detailReferences.appendChild(link);

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


    const status =
      detailStatusSelect.value;


    const notes =
      detailNotes.value.trim();


   await updateCommission(
  currentCommission.id,
  {
    status,
    admin_notes:
      notes || null,
    is_public:
      currentIsPublic
  }
);

  }
);


/* =========================================
   UPDATE COMMISSION
========================================= */

async function updateCommission(
  id,
  changes
) {

  saveButton.disabled = true;

  acceptButton.disabled = true;

  declineButton.disabled = true;


  detailMessage.textContent =
    "SAVING...";


  const {
    data,
    error
  } = await supabaseClient
    .from("commissions")
    .update(changes)
    .eq("id", id)
    .select()
    .single();


  if (error) {

    console.error(
      "Commission update error:",
      error
    );

    detailMessage.textContent =
      "COULD NOT SAVE CHANGES.";

    saveButton.disabled = false;

    acceptButton.disabled = false;

    declineButton.disabled = false;

    return;

  }


  /*
    Replace the local commission
    with the updated database row.
  */

  commissions =
    commissions.map(
      commission =>
        commission.id === id
          ? data
          : commission
    );


  currentCommission =
    data;


  updateStats();

  renderRequests();

  detailMessage.textContent =
    "CHANGES SAVED.";


  /*
    Refresh detail UI.
  */

  detailStatus.textContent =
    data.status;

  detailStatusSelect.value =
    data.status;

  detailNotes.value =
    data.admin_notes || "";

   currentIsPublic =
  data.is_public === true;

updateVisibilityUI();
   

  /*
    ACCEPT / DECLINE buttons disappear
    after leaving RECEIVED.
  */

  if (data.status === "RECEIVED") {

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


  saveButton.disabled = false;

  acceptButton.disabled = false;

  declineButton.disabled = false;

}


/* =========================================
   REFRESH
========================================= */

refreshButton.addEventListener(
  "click",
  async () => {

    refreshButton.disabled = true;

    refreshButton.textContent =
      "REFRESHING...";


    await loadCommissions();


    refreshButton.disabled = false;

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

      showAdmin(session.user);

    }

  }
);


/* =========================================
   START
========================================= */

checkSession();
