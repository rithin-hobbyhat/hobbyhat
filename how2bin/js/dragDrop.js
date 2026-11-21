/**
 * Unified Touch and Mouse Drag & Drop Engine for how2bin
 * Features:
 * 1. High-precision drop zone detection with document.elementFromPoint + bounding margin fallback
 * 2. Touch and mouse tracking with fallback to last known coords
 * 3. Tap-to-select and tap-to-place fallback
 * 4. Generous hit-targets so items can ALWAYS be smoothly dropped into bins
 */

class DragDropEngine {
  constructor() {
    this.activeItem = null;
    this.selectedItem = null;
    this.ghostEl = null;
    this.dropZoneSelector = null;
    this.onDropCallback = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastX = 0;
    this.lastY = 0;

    this.bindGlobalEvents();
  }

  setDropHandler(handler) {
    this.onDropCallback = handler;
  }

  registerDropZones(selector) {
    this.dropZoneSelector = selector;
  }

  getDropZones() {
    if (!this.dropZoneSelector) return [];
    return Array.from(document.querySelectorAll(this.dropZoneSelector));
  }

  bindGlobalEvents() {
    // Pointer and touch tracking
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    window.addEventListener('pointercancel', (e) => this.handlePointerCancel(e));

    // Prevent scrolling while actively dragging an item on mobile
    window.addEventListener('touchmove', (e) => {
      if (this.activeItem) {
        e.preventDefault();
        if (e.touches && e.touches[0]) {
          this.lastX = e.touches[0].clientX;
          this.lastY = e.touches[0].clientY;
        }
      }
    }, { passive: false });
  }

  makeDraggable(element, itemData) {
    element.classList.add('draggable-item');
    element.dataset.itemId = itemData.id;

    element.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      this.startDrag(e, element, itemData);
    });

    element.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      this.handleTapSelect(element, itemData);
    });
  }

  startDrag(e, element, itemData) {
    this.activeItem = { element, data: itemData };
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    this.lastX = clientX;
    this.lastY = clientY;

    this.createGhost(element, clientX, clientY);
    element.classList.add('is-being-dragged');

    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch(err) {}
    }

    AudioPlayer.grab();
  }

  createGhost(sourceEl, clientX, clientY) {
    if (this.ghostEl) {
      this.ghostEl.remove();
    }
    this.ghostEl = sourceEl.cloneNode(true);
    this.ghostEl.classList.add('drag-ghost');
    this.ghostEl.style.position = 'fixed';
    this.ghostEl.style.zIndex = '99999';
    this.ghostEl.style.pointerEvents = 'none';
    this.ghostEl.style.left = `${clientX}px`;
    this.ghostEl.style.top = `${clientY}px`;
    this.ghostEl.style.transform = 'translate(-50%, -50%) scale(1.15)';
    this.ghostEl.style.filter = 'drop-shadow(0 14px 28px rgba(0,0,0,0.5))';
    document.body.appendChild(this.ghostEl);
  }

  handlePointerMove(e) {
    if (!this.activeItem || !this.ghostEl) return;
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : this.lastX);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : this.lastY);
    this.lastX = clientX;
    this.lastY = clientY;

    this.ghostEl.style.left = `${clientX}px`;
    this.ghostEl.style.top = `${clientY}px`;

    const targetZone = this.findDropZoneUnder(clientX, clientY);
    this.highlightDropZone(targetZone);
  }

  handlePointerUp(e) {
    if (!this.activeItem) return;

    const clientX = (e.clientX !== undefined && e.clientX !== 0) ? e.clientX : this.lastX;
    const clientY = (e.clientY !== undefined && e.clientY !== 0) ? e.clientY : this.lastY;

    const targetZone = this.findDropZoneUnder(clientX, clientY);
    const item = this.activeItem;

    this.cleanupDrag();

    if (targetZone && this.onDropCallback) {
      this.onDropCallback(item.data, targetZone, item.element);
    }
  }

  handlePointerCancel() {
    this.cleanupDrag();
  }

  cleanupDrag() {
    if (this.activeItem && this.activeItem.element) {
      this.activeItem.element.classList.remove('is-being-dragged');
    }
    if (this.ghostEl) {
      this.ghostEl.remove();
      this.ghostEl = null;
    }
    this.activeItem = null;
    this.highlightDropZone(null);
  }

  findDropZoneUnder(clientX, clientY) {
    // 1. High precision hit test using elementFromPoint
    if (typeof document.elementFromPoint === 'function') {
      const el = document.elementFromPoint(clientX, clientY);
      if (el) {
        const matched = el.closest(this.dropZoneSelector) ||
                        el.closest('.seiri-station-card') ||
                        el.closest('.real-bin-station-card') ||
                        el.closest('.real-med-container-card') ||
                        el.closest('#quarantine-station') ||
                        el.closest('.seiri-box') ||
                        el.closest('.seiton-slot-card') ||
                        el.closest('.standard-slot-card');
        if (matched) return matched;
      }
    }

    // 2. Generous bounding-rect fallback with +20px margin tolerance
    const zones = this.getDropZones();
    const margin = 20;
    for (let zone of zones) {
      const rect = zone.getBoundingClientRect();
      if (
        clientX >= rect.left - margin &&
        clientX <= rect.right + margin &&
        clientY >= rect.top - margin &&
        clientY <= rect.bottom + margin
      ) {
        return zone;
      }
    }
    return null;
  }

  highlightDropZone(activeZone) {
    const zones = this.getDropZones();
    zones.forEach(zone => {
      if (zone === activeZone) {
        zone.classList.add('zone-hover');
      } else {
        zone.classList.remove('zone-hover');
      }
    });
  }

  // TAP-TO-SELECT / TAP-TO-PLACE SUPPORT
  handleTapSelect(element, itemData) {
    if (this.selectedItem && this.selectedItem.data.id === itemData.id) {
      this.clearSelection();
      return;
    }

    this.clearSelection();
    this.selectedItem = { element, data: itemData };
    element.classList.add('item-tap-selected');
    AudioPlayer.click();

    const zones = this.getDropZones();
    zones.forEach(z => z.classList.add('zone-awaiting-tap'));
  }

  handleDropZoneClick(zoneElement) {
    if (!this.selectedItem) return;
    const item = this.selectedItem;
    this.clearSelection();

    if (this.onDropCallback) {
      this.onDropCallback(item.data, zoneElement, item.element);
    }
  }

  clearSelection() {
    if (this.selectedItem && this.selectedItem.element) {
      this.selectedItem.element.classList.remove('item-tap-selected');
    }
    this.selectedItem = null;
    const zones = this.getDropZones();
    zones.forEach(z => z.classList.remove('zone-awaiting-tap'));
  }
}

const DragEngine = new DragDropEngine();
