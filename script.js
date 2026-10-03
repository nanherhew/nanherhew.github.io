function renderPublicProgress(commissions) {
  if (!publicProgressList) {
    return;
  }

  const progress = commissions.filter(
    commission =>
      publicStatusOrder.includes(commission.status)
  );

  if (!progress.length) {
    publicProgressList.innerHTML = `
      <div class="comm-status-empty">
        NO COMMISSIONS IN PROGRESS.
      </div>
    `;

    return;
  }

  publicProgressList.innerHTML = progress
    .map((commission, index) => {
      const status = commission.status;

      const statusClass =
        publicStatusClass[status] || "status-red";

      const image = commission.image_url
        ? `
          <img
            src="${escapePublicHTML(commission.image_url)}"
            alt="Commission for ${escapePublicHTML(commission.name)}"
          >
        `
        : `
          <div class="comm-progress-placeholder">
            NO IMAGE
          </div>
        `;

      return `
        <article class="comm-progress-item">

          <div class="comm-progress-image">
            ${image}
          </div>

          <div class="comm-progress-main">

            <span class="comm-progress-line ${statusClass}"></span>

            <div>
              <strong>
                ${escapePublicHTML(commission.name)}
              </strong>

              <span>
                ${escapePublicHTML(status)}
              </span>
            </div>

          </div>

          <span class="comm-progress-code">
            COMM / ${String(index + 1).padStart(3, "0")}
          </span>

        </article>
      `;
    })
    .join("");
}
