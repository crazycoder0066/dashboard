const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            purchaseOrderListLookupData: [],
            goodsReceiveStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            warehouseListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            receiveDate: '',
            description: '',
            purchaseOrderId: null,
            status: null,
            errors: { receiveDate: '', purchaseOrderId: '', status: '', description: '', itemWarehouseId: '', itemProductId: '', itemMovement: '' },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00',
            hasItemSelection: false,
            itemDeleteMode: false,
            isItemSubmitting: false,
            itemTitle: '',
            itemId: '',
            itemWarehouseId: null,
            itemProductId: null,
            itemMovement: 0,
        });

        const mainModalRef = Vue.ref(null);
        const itemModalRef = Vue.ref(null);
        const receiveDateRef = Vue.ref(null);
        const purchaseOrderIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const itemWarehouseIdRef = Vue.ref(null);
        const itemProductIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };
        const showItemModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('GoodsReceiveItemModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideItemModal = () => { bootstrap.Modal.getInstance(document.getElementById('GoodsReceiveItemModal'))?.hide(); };

        const validateForm = () => { state.errors.receiveDate = ''; state.errors.purchaseOrderId = ''; state.errors.status = ''; let isValid = true; if (!state.receiveDate) { state.errors.receiveDate = 'Receive date is required.'; isValid = false; } if (!state.purchaseOrderId) { state.errors.purchaseOrderId = 'Purchase Order is required.'; isValid = false; } if (!state.status) { state.errors.status = 'Status is required.'; isValid = false; } return isValid; };
        const resetFormState = () => { state.id = ''; state.number = ''; state.receiveDate = ''; state.description = ''; state.purchaseOrderId = null; state.status = null; state.errors = { receiveDate: '', purchaseOrderId: '', status: '', description: '', itemWarehouseId: '', itemProductId: '', itemMovement: '' }; state.secondaryData = []; };
        const resetItemFormState = () => { state.itemId = ''; state.itemWarehouseId = null; state.itemProductId = null; state.itemMovement = 0; state.errors.itemWarehouseId = ''; state.errors.itemProductId = ''; state.errors.itemMovement = ''; };

        const receiveDatePicker = { obj: null, create: () => { receiveDatePicker.obj = new ej.calendars.DatePicker({ placeholder: 'Select Date', format: 'yyyy-MM-dd', value: state.receiveDate ? new Date(state.receiveDate) : null, change: (e) => { state.receiveDate = e.value; } }); receiveDatePicker.obj.appendTo(receiveDateRef.value); }, refresh: () => { if (receiveDatePicker.obj) receiveDatePicker.obj.value = state.receiveDate ? new Date(state.receiveDate) : null; } };
        Vue.watch(() => state.receiveDate, () => { receiveDatePicker.refresh(); state.errors.receiveDate = ''; });

        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]' }); numberText.obj.appendTo(numberRef.value); } };

        const purchaseOrderListLookup = { obj: null, create: () => { if (state.purchaseOrderListLookupData && Array.isArray(state.purchaseOrderListLookupData)) { purchaseOrderListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.purchaseOrderListLookupData, fields: { value: 'id', text: 'number' }, placeholder: 'Select Purchase Order', filterBarPlaceholder: 'Search', sortOrder: 'Ascending', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('number', 'startsWith', e.text, true); e.updateData(state.purchaseOrderListLookupData, q); }, change: (e) => { state.purchaseOrderId = e.value; } }); purchaseOrderListLookup.obj.appendTo(purchaseOrderIdRef.value); } }, refresh: () => { if (purchaseOrderListLookup.obj) purchaseOrderListLookup.obj.value = state.purchaseOrderId; } };
        Vue.watch(() => state.purchaseOrderId, () => { purchaseOrderListLookup.refresh(); state.errors.purchaseOrderId = ''; });

        const goodsReceiveStatusListLookup = { obj: null, create: () => { if (state.goodsReceiveStatusListLookupData && Array.isArray(state.goodsReceiveStatusListLookupData)) { goodsReceiveStatusListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.goodsReceiveStatusListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select Status', change: (e) => { state.status = e.value; } }); goodsReceiveStatusListLookup.obj.appendTo(statusRef.value); } }, refresh: () => { if (goodsReceiveStatusListLookup.obj) goodsReceiveStatusListLookup.obj.value = state.status; } };
        Vue.watch(() => state.status, () => { goodsReceiveStatusListLookup.refresh(); state.errors.status = ''; });

        const itemWarehouseListLookup = { obj: null, create: () => { if (state.warehouseListLookupData && Array.isArray(state.warehouseListLookupData)) { itemWarehouseListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.warehouseListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Warehouse', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.warehouseListLookupData, q); }, change: (e) => { state.itemWarehouseId = e.value; } }); itemWarehouseListLookup.obj.appendTo(itemWarehouseIdRef.value); } }, refresh: () => { if (itemWarehouseListLookup.obj) itemWarehouseListLookup.obj.value = state.itemWarehouseId; } };
        Vue.watch(() => state.itemWarehouseId, () => { state.errors.itemWarehouseId = ''; itemWarehouseListLookup.refresh(); });

        const itemProductListLookup = { obj: null, create: () => { if (state.productListLookupData && Array.isArray(state.productListLookupData)) { itemProductListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.productListLookupData, fields: { value: 'id', text: 'numberName' }, placeholder: 'Select a Product', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('numberName', 'startsWith', e.text, true); e.updateData(state.productListLookupData, q); }, change: (e) => { state.itemProductId = e.value; if (!state.itemMovement) state.itemMovement = 1; } }); itemProductListLookup.obj.appendTo(itemProductIdRef.value); } }, refresh: () => { if (itemProductListLookup.obj) itemProductListLookup.obj.value = state.itemProductId; } };
        Vue.watch(() => state.itemProductId, () => { state.errors.itemProductId = ''; itemProductListLookup.refresh(); });

        const services = {
            getMainData: async () => AxiosManager.get('/GoodsReceive/GetGoodsReceiveList', {}),
            createMainData: async (receiveDate, description, status, purchaseOrderId, createdById) => AxiosManager.post('/GoodsReceive/CreateGoodsReceive', { receiveDate, description, status, purchaseOrderId, createdById }),
            updateMainData: async (id, receiveDate, description, status, purchaseOrderId, updatedById) => AxiosManager.post('/GoodsReceive/UpdateGoodsReceive', { id, receiveDate, description, status, purchaseOrderId, updatedById }),
            deleteMainData: async (id, deletedById) => AxiosManager.post('/GoodsReceive/DeleteGoodsReceive', { id, deletedById }),
            getPurchaseOrderListLookupData: async () => AxiosManager.get('/PurchaseOrder/GetPurchaseOrderList', {}),
            getGoodsReceiveStatusListLookupData: async () => AxiosManager.get('/GoodsReceive/GetGoodsReceiveStatusList', {}),
            getSecondaryData: async (moduleId) => AxiosManager.get('/InventoryTransaction/GoodsReceiveGetInvenTransList?moduleId=' + moduleId, {}),
            createSecondaryData: async (moduleId, warehouseId, productId, movement, createdById) => AxiosManager.post('/InventoryTransaction/GoodsReceiveCreateInvenTrans', { moduleId, warehouseId, productId, movement, createdById }),
            updateSecondaryData: async (id, warehouseId, productId, movement, updatedById) => AxiosManager.post('/InventoryTransaction/GoodsReceiveUpdateInvenTrans', { id, warehouseId, productId, movement, updatedById }),
            deleteSecondaryData: async (id, deletedById) => AxiosManager.post('/InventoryTransaction/GoodsReceiveDeleteInvenTrans', { id, deletedById }),
            getProductListLookupData: async () => AxiosManager.get('/Product/GetProductList', {}),
            getWarehouseListLookupData: async () => AxiosManager.get('/Warehouse/GetWarehouseList', {}),
        };

        const methods = {
            populateMainData: async () => { const r = await services.getMainData(); state.mainData = r?.data?.content?.data.map(item => ({ ...item, receiveDate: new Date(item.receiveDate), createdAtUtc: new Date(item.createdAtUtc) })); },
            populatePurchaseOrderListLookupData: async () => { const r = await services.getPurchaseOrderListLookupData(); state.purchaseOrderListLookupData = r?.data?.content?.data; },
            populateGoodsReceiveStatusListLookupData: async () => { const r = await services.getGoodsReceiveStatusListLookupData(); state.goodsReceiveStatusListLookupData = r?.data?.content?.data; },
            populateProductListLookupData: async () => { const r = await services.getProductListLookupData(); state.productListLookupData = r?.data?.content?.data.filter(p => p.physical === true).map(p => ({ ...p, numberName: `${p.number} - ${p.name}` })) || []; },
            populateWarehouseListLookupData: async () => { const r = await services.getWarehouseListLookupData(); state.warehouseListLookupData = r?.data?.content?.data.filter(w => w.systemWarehouse === false) || []; },
            populateSecondaryData: async (id) => { try { const r = await services.getSecondaryData(id); state.secondaryData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) })); methods.refreshSummary(); } catch { state.secondaryData = []; } },
            refreshSummary: () => { state.totalMovementFormatted = NumberFormatManager.formatToLocale(state.secondaryData.reduce((s, r) => s + (r.movement ?? 0), 0)); },
            onMainModalHidden: () => { resetFormState(); },
        };

        const mainModal = { obj: null, create: () => { mainModal.obj = new bootstrap.Modal(mainModalRef.value, { backdrop: 'static', keyboard: false }); } };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Goods Receive'; resetFormState(); state.showComplexDiv = false; showModal(); },
            openEdit: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Goods Receive'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.receiveDate = row.receiveDate ? new Date(row.receiveDate) : null; state.description = row.description ?? ''; state.purchaseOrderId = row.purchaseOrderId ?? ''; state.status = String(row.status ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = true; showModal(); },
            openDelete: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Goods Receive?'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.receiveDate = row.receiveDate ? new Date(row.receiveDate) : null; state.description = row.description ?? ''; state.purchaseOrderId = row.purchaseOrderId ?? ''; state.status = String(row.status ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = false; showModal(); },
            printPdf: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; window.open('/GoodsReceives/GoodsReceivePdf?id=' + (row.id ?? ''), '_blank'); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true; await new Promise(r => setTimeout(r, 300));
                    if (!validateForm()) return;
                    const response = state.id === '' ? await services.createMainData(state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId()) : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId()) : await services.updateMainData(state.id, state.receiveDate, state.description, state.status, state.purchaseOrderId, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) { state.mainTitle = 'Edit Goods Receive'; state.id = response?.data?.content?.data.id ?? ''; state.number = response?.data?.content?.data.number ?? ''; await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); state.showComplexDiv = true; Swal.fire({ icon: 'success', title: 'Save Successful', timer: 2000, showConfirmButton: false }); }
                        else { Swal.fire({ icon: 'success', title: 'Delete Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false }); setTimeout(() => { hideModal(); resetFormState(); }, 2000); }
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
            openAddItem: () => { state.itemDeleteMode = false; state.itemTitle = 'Add Item'; resetItemFormState(); showItemModal(); },
            openEditItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = false; state.itemTitle = 'Edit Item'; state.itemId = row.id ?? ''; state.itemWarehouseId = row.warehouseId ?? null; state.itemProductId = row.productId ?? null; state.itemMovement = row.movement ?? 0; showItemModal(); },
            openDeleteItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = true; state.itemTitle = 'Delete Item?'; state.itemId = row.id ?? ''; state.itemWarehouseId = row.warehouseId ?? null; state.itemProductId = row.productId ?? null; state.itemMovement = row.movement ?? 0; showItemModal(); },
            handleItemSubmit: async function () {
                try {
                    state.isItemSubmitting = true; await new Promise(r => setTimeout(r, 200));
                    if (!state.itemDeleteMode) { if (!state.itemWarehouseId) { state.errors.itemWarehouseId = 'Warehouse is required.'; return; } if (!state.itemProductId) { state.errors.itemProductId = 'Product is required.'; return; } if (!(state.itemMovement > 0)) { state.errors.itemMovement = 'Movement must be greater than zero.'; return; } }
                    const response = state.itemId === '' ? await services.createSecondaryData(state.id, state.itemWarehouseId, state.itemProductId, state.itemMovement, StorageManager.getUserId()) : state.itemDeleteMode ? await services.deleteSecondaryData(state.itemId, StorageManager.getUserId()) : await services.updateSecondaryData(state.itemId, state.itemWarehouseId, state.itemProductId, state.itemMovement, StorageManager.getUserId());
                    if (response.data.code === 200) { await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); Swal.fire({ icon: 'success', title: state.itemDeleteMode ? 'Delete Successful' : 'Save Successful', timer: 2000, showConfirmButton: false }); setTimeout(() => { hideItemModal(); if (state.itemDeleteMode) resetItemFormState(); }, 2000); }
                    else { Swal.fire({ icon: 'error', title: 'Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isItemSubmitting = false; }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['GoodsReceives']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                mainModal.create(); mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populatePurchaseOrderListLookupData(); purchaseOrderListLookup.create();
                await methods.populateGoodsReceiveStatusListLookupData(); goodsReceiveStatusListLookup.create();
                receiveDatePicker.create(); numberText.create();
                await methods.populateProductListLookupData();
                await methods.populateWarehouseListLookupData();
                itemWarehouseListLookup.create(); itemProductListLookup.create();
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
                        { data: 'receiveDate', title: 'Receive Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'purchaseOrderNumber', title: 'Purchase Order' },
                        { data: 'statusName', title: 'Status' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[4, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Goods Receives', exportOptions: { columns: ':visible' } }],
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
                        { data: 'warehouseId', title: 'Warehouse', render: d => { const w = state.warehouseListLookupData.find(x => x.id === d); return w ? w.name : (d ?? ''); } },
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

        return { mainModalRef, itemModalRef, receiveDateRef, purchaseOrderIdRef, statusRef, numberRef, itemWarehouseIdRef, itemProductIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
