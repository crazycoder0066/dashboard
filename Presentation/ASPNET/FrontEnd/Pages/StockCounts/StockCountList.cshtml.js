const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            warehouseListLookupData: [],
            stockCountStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            countDate: '',
            description: '',
            warehouseId: null,
            status: null,
            errors: {
                countDate: '',
                warehouseId: '',
                status: '',
                itemProductId: '',
                itemQtySCCount: '',
            },
            showComplexDiv: false,
            isSubmitting: false,
            totalMovementFormatted: '0.00',
            hasItemSelection: false,
            itemDeleteMode: false,
            isItemSubmitting: false,
            itemTitle: '',
            itemId: '',
            itemProductId: null,
            itemQtySCCount: 0,
        });

        const mainModalRef = Vue.ref(null);
        const itemModalRef = Vue.ref(null);
        const countDateRef = Vue.ref(null);
        const warehouseIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const itemProductIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };
        const showItemModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('StockCountItemModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideItemModal = () => { bootstrap.Modal.getInstance(document.getElementById('StockCountItemModal'))?.hide(); };

        const validateForm = function () {
            state.errors.countDate = ''; state.errors.warehouseId = ''; state.errors.status = '';
            let isValid = true;
            if (!state.countDate) { state.errors.countDate = 'Count date is required.'; isValid = false; }
            if (!state.warehouseId) { state.errors.warehouseId = 'Warehouse is required.'; isValid = false; }
            if (!state.status) { state.errors.status = 'Status is required.'; isValid = false; }
            return isValid;
        };

        const resetFormState = () => {
            state.id = ''; state.number = ''; state.countDate = ''; state.description = '';
            state.warehouseId = null; state.status = null;
            state.errors = { countDate: '', warehouseId: '', status: '', itemProductId: '', itemQtySCCount: '' };
            state.secondaryData = [];
        };

        const resetItemFormState = () => {
            state.itemId = ''; state.itemProductId = null; state.itemQtySCCount = 0;
            state.errors.itemProductId = ''; state.errors.itemQtySCCount = '';
        };

        const countDatePicker = {
            obj: null,
            create: () => {
                countDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date', format: 'yyyy-MM-dd',
                    value: state.countDate ? new Date(state.countDate) : null,
                    change: (e) => { state.countDate = e.value; }
                });
                countDatePicker.obj.appendTo(countDateRef.value);
            },
            refresh: () => { if (countDatePicker.obj) countDatePicker.obj.value = state.countDate ? new Date(state.countDate) : null; }
        };

        Vue.watch(() => state.countDate, () => { countDatePicker.refresh(); state.errors.countDate = ''; });

        const warehouseListLookup = {
            obj: null,
            create: () => {
                if (state.warehouseListLookupData && Array.isArray(state.warehouseListLookupData)) {
                    warehouseListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.warehouseListLookupData, fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Warehouse', allowFiltering: true,
                        filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.warehouseListLookupData, q); },
                        change: (e) => { state.warehouseId = e.value; }
                    });
                    warehouseListLookup.obj.appendTo(warehouseIdRef.value);
                }
            },
            refresh: () => { if (warehouseListLookup.obj) warehouseListLookup.obj.value = state.warehouseId; }
        };
        Vue.watch(() => state.warehouseId, () => { warehouseListLookup.refresh(); state.errors.warehouseId = ''; });

        const statusListLookup = {
            obj: null,
            create: () => {
                if (state.stockCountStatusListLookupData && Array.isArray(state.stockCountStatusListLookupData)) {
                    statusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.stockCountStatusListLookupData, fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status', change: (e) => { state.status = e.value; }
                    });
                    statusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => { if (statusListLookup.obj) statusListLookup.obj.value = state.status; }
        };
        Vue.watch(() => state.status, () => { statusListLookup.refresh(); state.errors.status = ''; });

        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]' }); numberText.obj.appendTo(numberRef.value); } };

        const itemProductListLookup = {
            obj: null,
            create: () => {
                if (state.productListLookupData && Array.isArray(state.productListLookupData)) {
                    itemProductListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.productListLookupData, fields: { value: 'id', text: 'numberName' },
                        placeholder: 'Select a Product', allowFiltering: true,
                        filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('numberName', 'startsWith', e.text, true); e.updateData(state.productListLookupData, q); },
                        change: (e) => { state.itemProductId = e.value; }
                    });
                    itemProductListLookup.obj.appendTo(itemProductIdRef.value);
                }
            },
            refresh: () => { if (itemProductListLookup.obj) itemProductListLookup.obj.value = state.itemProductId; }
        };
        Vue.watch(() => state.itemProductId, () => { state.errors.itemProductId = ''; itemProductListLookup.refresh(); });

        const services = {
            getMainData: async () => { try { return await AxiosManager.get('/StockCount/GetStockCountList', {}); } catch (e) { throw e; } },
            createMainData: async (countDate, description, status, warehouseId, createdById) => { try { return await AxiosManager.post('/StockCount/CreateStockCount', { countDate, description, status, warehouseId, createdById }); } catch (e) { throw e; } },
            updateMainData: async (id, countDate, description, status, warehouseId, updatedById) => { try { return await AxiosManager.post('/StockCount/UpdateStockCount', { id, countDate, description, status, warehouseId, updatedById }); } catch (e) { throw e; } },
            deleteMainData: async (id, deletedById) => { try { return await AxiosManager.post('/StockCount/DeleteStockCount', { id, deletedById }); } catch (e) { throw e; } },
            getWarehouseListLookupData: async () => { try { return await AxiosManager.get('/Warehouse/GetWarehouseList', {}); } catch (e) { throw e; } },
            getStockCountStatusListLookupData: async () => { try { return await AxiosManager.get('/StockCount/GetStockCountStatusList', {}); } catch (e) { throw e; } },
            getSecondaryData: async (moduleId) => { try { return await AxiosManager.get('/InventoryTransaction/StockCountGetInvenTransList?moduleId=' + moduleId, {}); } catch (e) { throw e; } },
            createSecondaryData: async (moduleId, productId, qtySCCount, createdById) => { try { return await AxiosManager.post('/InventoryTransaction/StockCountCreateInvenTrans', { moduleId, productId, qtySCCount, createdById }); } catch (e) { throw e; } },
            updateSecondaryData: async (id, productId, qtySCCount, updatedById) => { try { return await AxiosManager.post('/InventoryTransaction/StockCountUpdateInvenTrans', { id, productId, qtySCCount, updatedById }); } catch (e) { throw e; } },
            deleteSecondaryData: async (id, deletedById) => { try { return await AxiosManager.post('/InventoryTransaction/StockCountDeleteInvenTrans', { id, deletedById }); } catch (e) { throw e; } },
            getProductListLookupData: async () => { try { return await AxiosManager.get('/Product/GetProductList', {}); } catch (e) { throw e; } },
        };

        const methods = {
            populateMainData: async () => {
                const r = await services.getMainData();
                state.mainData = r?.data?.content?.data.map(item => ({ ...item, countDate: new Date(item.countDate), createdAtUtc: new Date(item.createdAtUtc) }));
            },
            populateWarehouseListLookupData: async () => { const r = await services.getWarehouseListLookupData(); state.warehouseListLookupData = r?.data?.content?.data.filter(w => w.systemWarehouse === false) || []; },
            populateStockCountStatusListLookupData: async () => { const r = await services.getStockCountStatusListLookupData(); state.stockCountStatusListLookupData = r?.data?.content?.data; },
            populateSecondaryData: async (stockCountId) => {
                try {
                    const r = await services.getSecondaryData(stockCountId);
                    state.secondaryData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) }));
                    methods.refreshSummary();
                } catch (e) { state.secondaryData = []; }
            },
            populateProductListLookupData: async () => {
                const r = await services.getProductListLookupData();
                state.productListLookupData = r?.data?.content?.data.filter(p => p.physical === true).map(p => ({ ...p, numberName: `${p.number} - ${p.name}` })) || [];
            },
            refreshSummary: () => {
                const total = state.secondaryData.reduce((sum, r) => sum + (r.qtySCDelta ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(total);
            },
            submitMainData: async () => {
                const isValid = validateForm();
                if (!isValid) return { isValid, response: null };
                try {
                    const response = state.id === ''
                        ? await services.createMainData(state.countDate, state.description, state.status, state.warehouseId, StorageManager.getUserId())
                        : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.countDate, state.description, state.status, state.warehouseId, StorageManager.getUserId());
                    return { isValid, response };
                } catch (e) { return { isValid, response: null }; }
            },
            onMainModalHidden: () => { resetFormState(); state.errors.countDate = ''; state.errors.warehouseId = ''; state.errors.status = ''; state.showComplexDiv = false; }
        };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Stock Count'; resetFormState(); state.showComplexDiv = false; showModal(); },
            openEdit: async () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                state.deleteMode = false; state.mainTitle = 'Edit Stock Count';
                state.id = row.id ?? ''; state.number = row.number ?? '';
                state.countDate = row.countDate ? new Date(row.countDate) : null;
                state.description = row.description ?? ''; state.warehouseId = row.warehouseId ?? '';
                state.status = String(row.status ?? '');
                await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = true;
                showModal();
            },
            openDelete: async () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                state.deleteMode = true; state.mainTitle = 'Delete Stock Count?';
                state.id = row.id ?? ''; state.number = row.number ?? '';
                state.countDate = row.countDate ? new Date(row.countDate) : null;
                state.description = row.description ?? ''; state.warehouseId = row.warehouseId ?? '';
                state.status = String(row.status ?? '');
                await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = false;
                showModal();
            },
            printPdf: () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                window.open('/StockCounts/StockCountPdf?id=' + (row.id ?? ''), '_blank');
            },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const { isValid, response } = await methods.submitMainData();
                    if (!isValid) return;
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Stock Count';
                            state.id = response?.data?.content?.data.id ?? '';
                            state.number = response?.data?.content?.data.number ?? '';
                            await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); state.showComplexDiv = true;
                            Swal.fire({ icon: 'success', title: 'Save Successful', timer: 2000, showConfirmButton: false });
                        } else {
                            Swal.fire({ icon: 'success', title: 'Delete Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                            setTimeout(() => { hideModal(); resetFormState(); }, 2000);
                        }
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
            openAddItem: () => { state.itemDeleteMode = false; state.itemTitle = 'Add Item'; resetItemFormState(); showItemModal(); },
            openEditItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = false; state.itemTitle = 'Edit Item'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemQtySCCount = row.qtySCCount ?? 0; showItemModal(); },
            openDeleteItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = true; state.itemTitle = 'Delete Item?'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemQtySCCount = row.qtySCCount ?? 0; showItemModal(); },
            handleItemSubmit: async function () {
                try {
                    state.isItemSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 200));
                    if (!state.itemDeleteMode && !state.itemProductId) { state.errors.itemProductId = 'Product is required.'; return; }
                    const response = state.itemId === ''
                        ? await services.createSecondaryData(state.id, state.itemProductId, state.itemQtySCCount, StorageManager.getUserId())
                        : state.itemDeleteMode ? await services.deleteSecondaryData(state.itemId, StorageManager.getUserId())
                            : await services.updateSecondaryData(state.itemId, state.itemProductId, state.itemQtySCCount, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateSecondaryData(state.id); secondaryGrid.refresh();
                        Swal.fire({ icon: 'success', title: state.itemDeleteMode ? 'Delete Successful' : 'Save Successful', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideItemModal(); if (state.itemDeleteMode) resetItemFormState(); }, 2000);
                    } else { Swal.fire({ icon: 'error', title: 'Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isItemSubmitting = false; }
            },
        };

        const mainModal = { obj: null, create: () => { mainModal.obj = new bootstrap.Modal(mainModalRef.value, { backdrop: 'static', keyboard: false }); } };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['StockCounts']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateWarehouseListLookupData(); warehouseListLookup.create();
                await methods.populateStockCountStatusListLookupData(); statusListLookup.create();
                countDatePicker.create(); numberText.create();
                await methods.populateProductListLookupData(); itemProductListLookup.create();
                secondaryGrid.create([]);
            } catch (e) { console.error('page init error:', e); }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', methods.onMainModalHidden);
            if (mainGrid.obj) mainGrid.obj.destroy();
            if (secondaryGrid.obj) secondaryGrid.obj.destroy();
        });

        const mainGrid = {
            obj: null,
            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'number', title: 'Number' },
                        { data: 'countDate', title: 'Count Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'warehouseName', title: 'Warehouse' },
                        { data: 'statusName', title: 'Status' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[4, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Stock Counts', exportOptions: { columns: ':visible' } }],
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
                        { data: 'qtySCSys', title: 'System Stock', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' },
                        { data: 'qtySCCount', title: 'Counted', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' },
                        { data: 'qtySCDelta', title: 'Adjustment', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' },
                    ],
                    order: [[0, 'asc']], pageLength: 100, paging: false,
                    select: { style: 'single', info: false },
                    layout: { topStart: null, topEnd: null, bottomStart: null, bottomEnd: null }
                });
                secondaryGrid.obj.on('select deselect', () => { state.hasItemSelection = secondaryGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { secondaryGrid.obj.clear().rows.add(state.secondaryData).draw(); },
        };

        return { mainModalRef, itemModalRef, countDateRef, warehouseIdRef, statusRef, numberRef, itemProductIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
