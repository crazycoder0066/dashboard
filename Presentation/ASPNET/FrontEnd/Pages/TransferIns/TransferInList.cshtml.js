const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            transferOutListLookupData: [],
            transferInStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            transferReceiveDate: '',
            description: '',
            transferOutId: null,
            status: null,
            errors: { transferReceiveDate: '', transferOutId: '', status: '', description: '', itemProductId: '', itemMovement: '' },
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
        const transferReceiveDateRef = Vue.ref(null);
        const transferOutIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const itemProductIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };
        const showItemModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('TransferInItemModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideItemModal = () => { bootstrap.Modal.getInstance(document.getElementById('TransferInItemModal'))?.hide(); };

        const validateForm = () => { state.errors.transferReceiveDate = ''; state.errors.transferOutId = ''; state.errors.status = ''; let isValid = true; if (!state.transferReceiveDate) { state.errors.transferReceiveDate = 'Receive date is required.'; isValid = false; } if (!state.transferOutId) { state.errors.transferOutId = 'Transfer Out is required.'; isValid = false; } if (!state.status) { state.errors.status = 'Status is required.'; isValid = false; } return isValid; };
        const resetFormState = () => { state.id = ''; state.number = ''; state.transferReceiveDate = ''; state.description = ''; state.transferOutId = null; state.status = null; state.errors = { transferReceiveDate: '', transferOutId: '', status: '', description: '', itemProductId: '', itemMovement: '' }; state.secondaryData = []; };
        const resetItemFormState = () => { state.itemId = ''; state.itemProductId = null; state.itemMovement = 0; state.errors.itemProductId = ''; state.errors.itemMovement = ''; };

        const transferReceiveDatePicker = { obj: null, create: () => { transferReceiveDatePicker.obj = new ej.calendars.DatePicker({ placeholder: 'Select Date', format: 'yyyy-MM-dd', value: state.transferReceiveDate ? new Date(state.transferReceiveDate) : null, change: (e) => { state.transferReceiveDate = e.value; } }); transferReceiveDatePicker.obj.appendTo(transferReceiveDateRef.value); }, refresh: () => { if (transferReceiveDatePicker.obj) transferReceiveDatePicker.obj.value = state.transferReceiveDate ? new Date(state.transferReceiveDate) : null; } };
        Vue.watch(() => state.transferReceiveDate, () => { transferReceiveDatePicker.refresh(); state.errors.transferReceiveDate = ''; });

        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]' }); numberText.obj.appendTo(numberRef.value); } };
        const transferOutListLookup = { obj: null, create: () => { if (state.transferOutListLookupData && Array.isArray(state.transferOutListLookupData)) { transferOutListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.transferOutListLookupData, fields: { value: 'id', text: 'number' }, placeholder: 'Select Transfer Out', filterBarPlaceholder: 'Search', sortOrder: 'Ascending', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('number', 'startsWith', e.text, true); e.updateData(state.transferOutListLookupData, q); }, change: (e) => { state.transferOutId = e.value; } }); transferOutListLookup.obj.appendTo(transferOutIdRef.value); } }, refresh: () => { if (transferOutListLookup.obj) transferOutListLookup.obj.value = state.transferOutId; } };
        Vue.watch(() => state.transferOutId, () => { transferOutListLookup.refresh(); state.errors.transferOutId = ''; });
        const transferInStatusListLookup = { obj: null, create: () => { if (state.transferInStatusListLookupData && Array.isArray(state.transferInStatusListLookupData)) { transferInStatusListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.transferInStatusListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select Status', change: (e) => { state.status = e.value; } }); transferInStatusListLookup.obj.appendTo(statusRef.value); } }, refresh: () => { if (transferInStatusListLookup.obj) transferInStatusListLookup.obj.value = state.status; } };
        Vue.watch(() => state.status, () => { transferInStatusListLookup.refresh(); state.errors.status = ''; });
        const itemProductListLookup = { obj: null, create: () => { if (state.productListLookupData && Array.isArray(state.productListLookupData)) { itemProductListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.productListLookupData, fields: { value: 'id', text: 'numberName' }, placeholder: 'Select a Product', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('numberName', 'startsWith', e.text, true); e.updateData(state.productListLookupData, q); }, change: (e) => { state.itemProductId = e.value; if (!state.itemMovement) state.itemMovement = 1; } }); itemProductListLookup.obj.appendTo(itemProductIdRef.value); } }, refresh: () => { if (itemProductListLookup.obj) itemProductListLookup.obj.value = state.itemProductId; } };
        Vue.watch(() => state.itemProductId, () => { state.errors.itemProductId = ''; itemProductListLookup.refresh(); });

        const services = {
            getMainData: async () => AxiosManager.get('/TransferIn/GetTransferInList', {}),
            createMainData: async (transferReceiveDate, description, status, transferOutId, createdById) => AxiosManager.post('/TransferIn/CreateTransferIn', { transferReceiveDate, description, status, transferOutId, createdById }),
            updateMainData: async (id, transferReceiveDate, description, status, transferOutId, updatedById) => AxiosManager.post('/TransferIn/UpdateTransferIn', { id, transferReceiveDate, description, status, transferOutId, updatedById }),
            deleteMainData: async (id, deletedById) => AxiosManager.post('/TransferIn/DeleteTransferIn', { id, deletedById }),
            getTransferOutListLookupData: async () => AxiosManager.get('/TransferOut/GetTransferOutList', {}),
            getTransferInStatusListLookupData: async () => AxiosManager.get('/TransferIn/GetTransferInStatusList', {}),
            getSecondaryData: async (moduleId) => AxiosManager.get('/InventoryTransaction/TransferInGetInvenTransList?moduleId=' + moduleId, {}),
            createSecondaryData: async (moduleId, productId, movement, createdById) => AxiosManager.post('/InventoryTransaction/TransferInCreateInvenTrans', { moduleId, productId, movement, createdById }),
            updateSecondaryData: async (id, productId, movement, updatedById) => AxiosManager.post('/InventoryTransaction/TransferInUpdateInvenTrans', { id, productId, movement, updatedById }),
            deleteSecondaryData: async (id, deletedById) => AxiosManager.post('/InventoryTransaction/TransferInDeleteInvenTrans', { id, deletedById }),
            getProductListLookupData: async () => AxiosManager.get('/Product/GetProductList', {}),
        };

        const methods = {
            populateMainData: async () => { const r = await services.getMainData(); state.mainData = r?.data?.content?.data.map(item => ({ ...item, transferReceiveDate: new Date(item.transferReceiveDate), createdAtUtc: new Date(item.createdAtUtc) })); },
            populateTransferOutListLookupData: async () => { const r = await services.getTransferOutListLookupData(); state.transferOutListLookupData = r?.data?.content?.data; },
            populateTransferInStatusListLookupData: async () => { const r = await services.getTransferInStatusListLookupData(); state.transferInStatusListLookupData = r?.data?.content?.data; },
            populateProductListLookupData: async () => { const r = await services.getProductListLookupData(); state.productListLookupData = r?.data?.content?.data.filter(p => p.physical === true).map(p => ({ ...p, numberName: `${p.number} - ${p.name}` })) || []; },
            populateSecondaryData: async (id) => { try { const r = await services.getSecondaryData(id); state.secondaryData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) })); methods.refreshSummary(); } catch { state.secondaryData = []; } },
            refreshSummary: () => { state.totalMovementFormatted = NumberFormatManager.formatToLocale(state.secondaryData.reduce((s, r) => s + (r.movement ?? 0), 0)); },
            onMainModalHidden: () => { state.errors.transferReceiveDate = ''; state.errors.transferOutId = ''; state.errors.status = ''; },
        };

        const mainModal = { obj: null, create: () => { mainModal.obj = new bootstrap.Modal(mainModalRef.value, { backdrop: 'static', keyboard: false }); } };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Transfer In'; resetFormState(); state.showComplexDiv = false; showModal(); },
            openEdit: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Transfer In'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.transferReceiveDate = row.transferReceiveDate ? new Date(row.transferReceiveDate) : null; state.description = row.description ?? ''; state.transferOutId = row.transferOutId ?? ''; state.status = String(row.status ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = true; showModal(); },
            openDelete: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Transfer In?'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.transferReceiveDate = row.transferReceiveDate ? new Date(row.transferReceiveDate) : null; state.description = row.description ?? ''; state.transferOutId = row.transferOutId ?? ''; state.status = String(row.status ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = false; showModal(); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true; await new Promise(r => setTimeout(r, 300));
                    if (!validateForm()) return;
                    const response = state.id === '' ? await services.createMainData(state.transferReceiveDate, state.description, state.status, state.transferOutId, StorageManager.getUserId()) : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId()) : await services.updateMainData(state.id, state.transferReceiveDate, state.description, state.status, state.transferOutId, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) { state.mainTitle = 'Edit Transfer In'; state.id = response?.data?.content?.data.id ?? ''; state.number = response?.data?.content?.data.number ?? ''; await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); state.showComplexDiv = true; Swal.fire({ icon: 'success', title: 'Save Successful', timer: 2000, showConfirmButton: false }); }
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
                await SecurityManager.authorizePage(['TransferIns']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                mainModal.create(); mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateTransferOutListLookupData(); transferOutListLookup.create();
                await methods.populateTransferInStatusListLookupData(); transferInStatusListLookup.create();
                transferReceiveDatePicker.create(); numberText.create();
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
                        { data: 'transferReceiveDate', title: 'Receive Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'transferOutNumber', title: 'Transfer Out' },
                        { data: 'statusName', title: 'Status' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[4, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Transfer Ins', exportOptions: { columns: ':visible' } }],
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

        return { mainModalRef, itemModalRef, transferReceiveDateRef, transferOutIdRef, statusRef, numberRef, itemProductIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
