const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            warehouseFromListLookupData: [],
            warehouseToListLookupData: [],
            transferOutStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            transferReleaseDate: '',
            description: '',
            warehouseFromId: null,
            warehouseToId: null,
            status: null,
            errors: { transferReleaseDate: '', warehouseFromId: '', warehouseToId: '', status: '', description: '', itemProductId: '', itemMovement: '' },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00',
            hasItemSelection: false,
            itemDeleteMode: false,
            isItemSubmitting: false,
            itemTitle: '',
            itemId: '',
            itemProductId: null,
            itemMovement: 0,
        });

        const mainModalRef = Vue.ref(null);
        const itemModalRef = Vue.ref(null);
        const transferReleaseDateRef = Vue.ref(null);
        const warehouseFromIdRef = Vue.ref(null);
        const warehouseToIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const itemProductIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };
        const showItemModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('TransferOutItemModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideItemModal = () => { bootstrap.Modal.getInstance(document.getElementById('TransferOutItemModal'))?.hide(); };

        const validateForm = () => { state.errors.transferReleaseDate = ''; state.errors.warehouseFromId = ''; state.errors.warehouseToId = ''; state.errors.status = ''; let isValid = true; if (!state.transferReleaseDate) { state.errors.transferReleaseDate = 'Release date is required.'; isValid = false; } if (!state.warehouseFromId) { state.errors.warehouseFromId = 'Warehouse From is required.'; isValid = false; } if (!state.warehouseToId) { state.errors.warehouseToId = 'Warehouse To is required.'; isValid = false; } if (!state.status) { state.errors.status = 'Status is required.'; isValid = false; } return isValid; };
        const resetFormState = () => { state.id = ''; state.number = ''; state.transferReleaseDate = ''; state.description = ''; state.warehouseFromId = null; state.warehouseToId = null; state.status = null; state.errors = { transferReleaseDate: '', warehouseFromId: '', warehouseToId: '', status: '', description: '', itemProductId: '', itemMovement: '' }; state.secondaryData = []; };
        const resetItemFormState = () => { state.itemId = ''; state.itemProductId = null; state.itemMovement = 0; state.errors.itemProductId = ''; state.errors.itemMovement = ''; };

        const transferReleaseDatePicker = { obj: null, create: () => { transferReleaseDatePicker.obj = new ej.calendars.DatePicker({ placeholder: 'Select Date', format: 'yyyy-MM-dd', value: state.transferReleaseDate ? new Date(state.transferReleaseDate) : null, change: (e) => { state.transferReleaseDate = e.value; } }); transferReleaseDatePicker.obj.appendTo(transferReleaseDateRef.value); }, refresh: () => { if (transferReleaseDatePicker.obj) transferReleaseDatePicker.obj.value = state.transferReleaseDate ? new Date(state.transferReleaseDate) : null; } };
        Vue.watch(() => state.transferReleaseDate, () => { transferReleaseDatePicker.refresh(); state.errors.transferReleaseDate = ''; });

        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]' }); numberText.obj.appendTo(numberRef.value); } };

        const warehouseFromListLookup = { obj: null, create: () => { if (state.warehouseFromListLookupData && Array.isArray(state.warehouseFromListLookupData)) { warehouseFromListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.warehouseFromListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select Warehouse From', filterBarPlaceholder: 'Search', sortOrder: 'Ascending', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.warehouseFromListLookupData, q); }, change: (e) => { state.warehouseFromId = e.value; } }); warehouseFromListLookup.obj.appendTo(warehouseFromIdRef.value); } }, refresh: () => { if (warehouseFromListLookup.obj) warehouseFromListLookup.obj.value = state.warehouseFromId; } };
        Vue.watch(() => state.warehouseFromId, () => { warehouseFromListLookup.refresh(); state.errors.warehouseFromId = ''; });

        const warehouseToListLookup = { obj: null, create: () => { if (state.warehouseToListLookupData && Array.isArray(state.warehouseToListLookupData)) { warehouseToListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.warehouseToListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select Warehouse To', filterBarPlaceholder: 'Search', sortOrder: 'Ascending', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.warehouseToListLookupData, q); }, change: (e) => { state.warehouseToId = e.value; } }); warehouseToListLookup.obj.appendTo(warehouseToIdRef.value); } }, refresh: () => { if (warehouseToListLookup.obj) warehouseToListLookup.obj.value = state.warehouseToId; } };
        Vue.watch(() => state.warehouseToId, () => { warehouseToListLookup.refresh(); state.errors.warehouseToId = ''; });

        const transferOutStatusListLookup = { obj: null, create: () => { if (state.transferOutStatusListLookupData && Array.isArray(state.transferOutStatusListLookupData)) { transferOutStatusListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.transferOutStatusListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select Status', change: (e) => { state.status = e.value; } }); transferOutStatusListLookup.obj.appendTo(statusRef.value); } }, refresh: () => { if (transferOutStatusListLookup.obj) transferOutStatusListLookup.obj.value = state.status; } };
        Vue.watch(() => state.status, () => { transferOutStatusListLookup.refresh(); state.errors.status = ''; });

        const itemProductListLookup = { obj: null, create: () => { if (state.productListLookupData && Array.isArray(state.productListLookupData)) { itemProductListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.productListLookupData, fields: { value: 'id', text: 'numberName' }, placeholder: 'Select a Product', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('numberName', 'startsWith', e.text, true); e.updateData(state.productListLookupData, q); }, change: (e) => { state.itemProductId = e.value; if (!state.itemMovement) state.itemMovement = 1; } }); itemProductListLookup.obj.appendTo(itemProductIdRef.value); } }, refresh: () => { if (itemProductListLookup.obj) itemProductListLookup.obj.value = state.itemProductId; } };
        Vue.watch(() => state.itemProductId, () => { state.errors.itemProductId = ''; itemProductListLookup.refresh(); });

        const services = {
            getMainData: async () => AxiosManager.get('/TransferOut/GetTransferOutList', {}),
            createMainData: async (transferReleaseDate, description, status, warehouseFromId, warehouseToId, createdById) => AxiosManager.post('/TransferOut/CreateTransferOut', { transferReleaseDate, description, status, warehouseFromId, warehouseToId, createdById }),
            updateMainData: async (id, transferReleaseDate, description, status, warehouseFromId, warehouseToId, updatedById) => AxiosManager.post('/TransferOut/UpdateTransferOut', { id, transferReleaseDate, description, status, warehouseFromId, warehouseToId, updatedById }),
            deleteMainData: async (id, deletedById) => AxiosManager.post('/TransferOut/DeleteTransferOut', { id, deletedById }),
            getWarehouseFromListLookupData: async () => AxiosManager.get('/Warehouse/GetWarehouseList', {}),
            getWarehouseToListLookupData: async () => AxiosManager.get('/Warehouse/GetWarehouseList', {}),
            getTransferOutStatusListLookupData: async () => AxiosManager.get('/TransferOut/GetTransferOutStatusList', {}),
            getSecondaryData: async (moduleId) => AxiosManager.get('/InventoryTransaction/TransferOutGetInvenTransList?moduleId=' + moduleId, {}),
            createSecondaryData: async (moduleId, productId, movement, createdById) => AxiosManager.post('/InventoryTransaction/TransferOutCreateInvenTrans', { moduleId, productId, movement, createdById }),
            updateSecondaryData: async (id, productId, movement, updatedById) => AxiosManager.post('/InventoryTransaction/TransferOutUpdateInvenTrans', { id, productId, movement, updatedById }),
            deleteSecondaryData: async (id, deletedById) => AxiosManager.post('/InventoryTransaction/TransferOutDeleteInvenTrans', { id, deletedById }),
            getProductListLookupData: async () => AxiosManager.get('/Product/GetProductList', {}),
        };

        const methods = {
            populateMainData: async () => { const r = await services.getMainData(); state.mainData = r?.data?.content?.data.map(item => ({ ...item, transferReleaseDate: new Date(item.transferReleaseDate), createdAtUtc: new Date(item.createdAtUtc) })); },
            populateWarehouseFromListLookupData: async () => { const r = await services.getWarehouseFromListLookupData(); state.warehouseFromListLookupData = r?.data?.content?.data.filter(w => w.systemWarehouse === false) || []; },
            populateWarehouseToListLookupData: async () => { const r = await services.getWarehouseToListLookupData(); state.warehouseToListLookupData = r?.data?.content?.data.filter(w => w.systemWarehouse === false) || []; },
            populateTransferOutStatusListLookupData: async () => { const r = await services.getTransferOutStatusListLookupData(); state.transferOutStatusListLookupData = r?.data?.content?.data; },
            populateProductListLookupData: async () => { const r = await services.getProductListLookupData(); state.productListLookupData = r?.data?.content?.data.filter(p => p.physical === true).map(p => ({ ...p, numberName: `${p.number} - ${p.name}` })) || []; },
            populateSecondaryData: async (id) => { try { const r = await services.getSecondaryData(id); state.secondaryData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) })); methods.refreshSummary(); } catch { state.secondaryData = []; } },
            refreshSummary: () => { state.totalMovementFormatted = NumberFormatManager.formatToLocale(state.secondaryData.reduce((s, r) => s + (r.movement ?? 0), 0)); },
            onMainModalHidden: () => { state.errors.transferReleaseDate = ''; state.errors.warehouseFromId = ''; state.errors.warehouseToId = ''; state.errors.status = ''; },
        };

        const mainModal = { obj: null, create: () => { mainModal.obj = new bootstrap.Modal(mainModalRef.value, { backdrop: 'static', keyboard: false }); } };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Transfer Out'; resetFormState(); state.showComplexDiv = false; showModal(); },
            openEdit: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Transfer Out'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.transferReleaseDate = row.transferReleaseDate ? new Date(row.transferReleaseDate) : null; state.description = row.description ?? ''; state.warehouseFromId = row.warehouseFromId ?? ''; state.warehouseToId = row.warehouseToId ?? ''; state.status = String(row.status ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = true; showModal(); },
            openDelete: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Transfer Out?'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.transferReleaseDate = row.transferReleaseDate ? new Date(row.transferReleaseDate) : null; state.description = row.description ?? ''; state.warehouseFromId = row.warehouseFromId ?? ''; state.warehouseToId = row.warehouseToId ?? ''; state.status = String(row.status ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = false; showModal(); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true; await new Promise(r => setTimeout(r, 300));
                    if (!validateForm()) return;
                    const response = state.id === '' ? await services.createMainData(state.transferReleaseDate, state.description, state.status, state.warehouseFromId, state.warehouseToId, StorageManager.getUserId()) : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId()) : await services.updateMainData(state.id, state.transferReleaseDate, state.description, state.status, state.warehouseFromId, state.warehouseToId, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) { state.mainTitle = 'Edit Transfer Out'; state.id = response?.data?.content?.data.id ?? ''; state.number = response?.data?.content?.data.number ?? ''; await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); state.showComplexDiv = true; Swal.fire({ icon: 'success', title: 'Save Successful', timer: 2000, showConfirmButton: false }); }
                        else { Swal.fire({ icon: 'success', title: 'Delete Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false }); setTimeout(() => { hideModal(); resetFormState(); }, 2000); }
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
            openAddItem: () => { state.itemDeleteMode = false; state.itemTitle = 'Add Item'; resetItemFormState(); showItemModal(); },
            openEditItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = false; state.itemTitle = 'Edit Item'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemMovement = row.movement ?? 0; showItemModal(); },
            openDeleteItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = true; state.itemTitle = 'Delete Item?'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemMovement = row.movement ?? 0; showItemModal(); },
            handleItemSubmit: async function () {
                try {
                    state.isItemSubmitting = true; await new Promise(r => setTimeout(r, 200));
                    if (!state.itemDeleteMode) { if (!state.itemProductId) { state.errors.itemProductId = 'Product is required.'; return; } if (!(state.itemMovement > 0)) { state.errors.itemMovement = 'Movement must be greater than zero.'; return; } }
                    const response = state.itemId === '' ? await services.createSecondaryData(state.id, state.itemProductId, state.itemMovement, StorageManager.getUserId()) : state.itemDeleteMode ? await services.deleteSecondaryData(state.itemId, StorageManager.getUserId()) : await services.updateSecondaryData(state.itemId, state.itemProductId, state.itemMovement, StorageManager.getUserId());
                    if (response.data.code === 200) { await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); Swal.fire({ icon: 'success', title: state.itemDeleteMode ? 'Delete Successful' : 'Save Successful', timer: 2000, showConfirmButton: false }); setTimeout(() => { hideItemModal(); if (state.itemDeleteMode) resetItemFormState(); }, 2000); }
                    else { Swal.fire({ icon: 'error', title: 'Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isItemSubmitting = false; }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['TransferOuts']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                mainModal.create(); mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateWarehouseFromListLookupData(); warehouseFromListLookup.create();
                await methods.populateWarehouseToListLookupData(); warehouseToListLookup.create();
                await methods.populateTransferOutStatusListLookupData(); transferOutStatusListLookup.create();
                transferReleaseDatePicker.create(); numberText.create();
                await methods.populateProductListLookupData(); itemProductListLookup.create();
                secondaryGrid.create([]);
            } catch (e) { console.error('page init error:', e); }
        });

        Vue.onUnmounted(() => { mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden); if (mainGrid.obj) mainGrid.obj.destroy(); if (secondaryGrid.obj) secondaryGrid.obj.destroy(); });

        const mainGrid = {
            obj: null,
            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'number', title: 'Number' },
                        { data: 'transferReleaseDate', title: 'Release Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'warehouseFromName', title: 'From Warehouse' },
                        { data: 'warehouseToName', title: 'To Warehouse' },
                        { data: 'statusName', title: 'Status' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[5, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Transfer Outs', exportOptions: { columns: ':visible' } }],
                    layout: { topStart: null, topEnd: { search: { placeholder: 'Search...' } }, bottomStart: 'info', bottomEnd: 'paging' }
                });
                mainGrid.obj.on('select deselect', () => { state.hasSelection = mainGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { mainGrid.obj.clear().rows.add(state.mainData).draw(); },
        };

        const secondaryGrid = {
            obj: null,
            create: (dataSource) => {
                secondaryGrid.obj = new DataTable('#secondaryGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'productId', title: 'Product', render: d => { const p = state.productListLookupData.find(x => x.id === d); return p ? p.numberName : (d ?? ''); } },
                        { data: 'movement', title: 'Movement', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                    ],
                    order: [[0, 'asc']], paging: false,
                    select: { style: 'single', info: false },
                    layout: { topStart: null, topEnd: null, bottomStart: null, bottomEnd: null }
                });
                secondaryGrid.obj.on('select deselect', () => { state.hasItemSelection = secondaryGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { secondaryGrid.obj.clear().rows.add(state.secondaryData).draw(); },
        };

        return { mainModalRef, itemModalRef, transferReleaseDateRef, warehouseFromIdRef, warehouseToIdRef, statusRef, numberRef, itemProductIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
