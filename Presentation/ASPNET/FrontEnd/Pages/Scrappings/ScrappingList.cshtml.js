const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            warehouseListLookupData: [],
            scrappingStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            scrappingDate: '',
            description: '',
            warehouseId: null,
            status: null,
            errors: {
                scrappingDate: '',
                warehouseId: '',
                status: '',
                itemProductId: '',
                itemMovement: '',
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
            itemMovement: 0,
        });

        const mainModalRef = Vue.ref(null);
        const itemModalRef = Vue.ref(null);
        const scrappingDateRef = Vue.ref(null);
        const warehouseIdRef = Vue.ref(null);
        const statusRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const itemProductIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };
        const showItemModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('ScrappingItemModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideItemModal = () => { bootstrap.Modal.getInstance(document.getElementById('ScrappingItemModal'))?.hide(); };

        const validateForm = function () {
            state.errors.scrappingDate = ''; state.errors.warehouseId = ''; state.errors.status = '';
            let isValid = true;
            if (!state.scrappingDate) { state.errors.scrappingDate = 'Scrapping date is required.'; isValid = false; }
            if (!state.warehouseId) { state.errors.warehouseId = 'Warehouse is required.'; isValid = false; }
            if (!state.status) { state.errors.status = 'Status is required.'; isValid = false; }
            return isValid;
        };

        const resetFormState = () => {
            state.id = ''; state.number = ''; state.scrappingDate = ''; state.description = '';
            state.warehouseId = null; state.status = null;
            state.errors = { scrappingDate: '', warehouseId: '', status: '', itemProductId: '', itemMovement: '' };
            state.secondaryData = [];
        };

        const resetItemFormState = () => {
            state.itemId = ''; state.itemProductId = null; state.itemMovement = 0;
            state.errors.itemProductId = ''; state.errors.itemMovement = '';
        };

        const scrappingDatePicker = {
            obj: null,
            create: () => {
                scrappingDatePicker.obj = new ej.calendars.DatePicker({
                    placeholder: 'Select Date', format: 'yyyy-MM-dd',
                    value: state.scrappingDate ? new Date(state.scrappingDate) : null,
                    change: (e) => { state.scrappingDate = e.value; }
                });
                scrappingDatePicker.obj.appendTo(scrappingDateRef.value);
            },
            refresh: () => { if (scrappingDatePicker.obj) scrappingDatePicker.obj.value = state.scrappingDate ? new Date(state.scrappingDate) : null; }
        };
        Vue.watch(() => state.scrappingDate, () => { scrappingDatePicker.refresh(); state.errors.scrappingDate = ''; });

        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]' }); numberText.obj.appendTo(numberRef.value); } };

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
                if (state.scrappingStatusListLookupData && Array.isArray(state.scrappingStatusListLookupData)) {
                    statusListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.scrappingStatusListLookupData, fields: { value: 'id', text: 'name' },
                        placeholder: 'Select Status', change: (e) => { state.status = e.value; }
                    });
                    statusListLookup.obj.appendTo(statusRef.value);
                }
            },
            refresh: () => { if (statusListLookup.obj) statusListLookup.obj.value = state.status; }
        };
        Vue.watch(() => state.status, () => { statusListLookup.refresh(); state.errors.status = ''; });

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
            getMainData: async () => { try { return await AxiosManager.get('/Scrapping/GetScrappingList', {}); } catch (e) { throw e; } },
            createMainData: async (scrappingDate, description, status, warehouseId, createdById) => { try { return await AxiosManager.post('/Scrapping/CreateScrapping', { scrappingDate, description, status, warehouseId, createdById }); } catch (e) { throw e; } },
            updateMainData: async (id, scrappingDate, description, status, warehouseId, updatedById) => { try { return await AxiosManager.post('/Scrapping/UpdateScrapping', { id, scrappingDate, description, status, warehouseId, updatedById }); } catch (e) { throw e; } },
            deleteMainData: async (id, deletedById) => { try { return await AxiosManager.post('/Scrapping/DeleteScrapping', { id, deletedById }); } catch (e) { throw e; } },
            getWarehouseListLookupData: async () => { try { return await AxiosManager.get('/Warehouse/GetWarehouseList', {}); } catch (e) { throw e; } },
            getScrappingStatusListLookupData: async () => { try { return await AxiosManager.get('/Scrapping/GetScrappingStatusList', {}); } catch (e) { throw e; } },
            getSecondaryData: async (moduleId) => { try { return await AxiosManager.get('/InventoryTransaction/ScrappingGetInvenTransList?moduleId=' + moduleId, {}); } catch (e) { throw e; } },
            createSecondaryData: async (moduleId, productId, movement, createdById) => { try { return await AxiosManager.post('/InventoryTransaction/ScrappingCreateInvenTrans', { moduleId, productId, movement, createdById }); } catch (e) { throw e; } },
            updateSecondaryData: async (id, productId, movement, updatedById) => { try { return await AxiosManager.post('/InventoryTransaction/ScrappingUpdateInvenTrans', { id, productId, movement, updatedById }); } catch (e) { throw e; } },
            deleteSecondaryData: async (id, deletedById) => { try { return await AxiosManager.post('/InventoryTransaction/ScrappingDeleteInvenTrans', { id, deletedById }); } catch (e) { throw e; } },
            getProductListLookupData: async () => { try { return await AxiosManager.get('/Product/GetProductList', {}); } catch (e) { throw e; } },
        };

        const methods = {
            populateMainData: async () => {
                const r = await services.getMainData();
                state.mainData = r?.data?.content?.data.map(item => ({ ...item, scrappingDate: new Date(item.scrappingDate), createdAtUtc: new Date(item.createdAtUtc) }));
            },
            populateWarehouseListLookupData: async () => { const r = await services.getWarehouseListLookupData(); state.warehouseListLookupData = r?.data?.content?.data.filter(w => w.systemWarehouse === false) || []; },
            populateScrappingStatusListLookupData: async () => { const r = await services.getScrappingStatusListLookupData(); state.scrappingStatusListLookupData = r?.data?.content?.data; },
            populateSecondaryData: async (scrappingId) => {
                try {
                    const r = await services.getSecondaryData(scrappingId);
                    state.secondaryData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) }));
                    methods.refreshSummary();
                } catch (e) { state.secondaryData = []; }
            },
            populateProductListLookupData: async () => {
                const r = await services.getProductListLookupData();
                state.productListLookupData = r?.data?.content?.data.filter(p => p.physical === true).map(p => ({ ...p, numberName: `${p.number} - ${p.name}` })) || [];
            },
            refreshSummary: () => {
                const total = state.secondaryData.reduce((sum, r) => sum + (r.movement ?? 0), 0);
                state.totalMovementFormatted = NumberFormatManager.formatToLocale(total);
            },
            submitMainData: async () => {
                const isValid = validateForm();
                if (!isValid) return { isValid, response: null };
                try {
                    const response = state.id === ''
                        ? await services.createMainData(state.scrappingDate, state.description, state.status, state.warehouseId, StorageManager.getUserId())
                        : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.scrappingDate, state.description, state.status, state.warehouseId, StorageManager.getUserId());
                    return { isValid, response };
                } catch (e) { return { isValid, response: null }; }
            },
            onMainModalHidden: () => { state.errors.scrappingDate = ''; state.errors.warehouseId = ''; state.errors.status = ''; },
        };

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Scrapping'; resetFormState(); state.showComplexDiv = false; showModal(); },
            openEdit: async () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                state.deleteMode = false; state.mainTitle = 'Edit Scrapping';
                state.id = row.id ?? ''; state.number = row.number ?? '';
                state.scrappingDate = row.scrappingDate ? new Date(row.scrappingDate) : null;
                state.description = row.description ?? ''; state.warehouseId = row.warehouseId ?? '';
                state.status = String(row.status ?? '');
                await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = true;
                showModal();
            },
            openDelete: async () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                state.deleteMode = true; state.mainTitle = 'Delete Scrapping?';
                state.id = row.id ?? ''; state.number = row.number ?? '';
                state.scrappingDate = row.scrappingDate ? new Date(row.scrappingDate) : null;
                state.description = row.description ?? ''; state.warehouseId = row.warehouseId ?? '';
                state.status = String(row.status ?? '');
                await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = false;
                showModal();
            },
            printPdf: () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                window.open('/Scrappings/ScrappingPdf?id=' + (row.id ?? ''), '_blank');
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
                            state.mainTitle = 'Edit Scrapping';
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
            openEditItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = false; state.itemTitle = 'Edit Item'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemMovement = row.movement ?? 0; showItemModal(); },
            openDeleteItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = true; state.itemTitle = 'Delete Item?'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemMovement = row.movement ?? 0; showItemModal(); },
            handleItemSubmit: async function () {
                try {
                    state.isItemSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 200));
                    if (!state.itemDeleteMode && !state.itemProductId) { state.errors.itemProductId = 'Product is required.'; return; }
                    const response = state.itemId === ''
                        ? await services.createSecondaryData(state.id, state.itemProductId, state.itemMovement, StorageManager.getUserId())
                        : state.itemDeleteMode ? await services.deleteSecondaryData(state.itemId, StorageManager.getUserId())
                            : await services.updateSecondaryData(state.itemId, state.itemProductId, state.itemMovement, StorageManager.getUserId());
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
                await SecurityManager.authorizePage(['Scrappings']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                mainModal.create();
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateWarehouseListLookupData(); warehouseListLookup.create();
                await methods.populateScrappingStatusListLookupData(); statusListLookup.create();
                scrappingDatePicker.create(); numberText.create();
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
                        { data: 'scrappingDate', title: 'Scrapping Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'warehouseName', title: 'Warehouse' },
                        { data: 'statusName', title: 'Status' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[4, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Scrappings', exportOptions: { columns: ':visible' } }],
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
                        { data: 'movement', title: 'Movement', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' },
                    ],
                    order: [[0, 'asc']], pageLength: 100, paging: false,
                    select: { style: 'single', info: false },
                    layout: { topStart: null, topEnd: null, bottomStart: null, bottomEnd: null }
                });
                secondaryGrid.obj.on('select deselect', () => { state.hasItemSelection = secondaryGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { secondaryGrid.obj.clear().rows.add(state.secondaryData).draw(); },
        };

        return { mainModalRef, itemModalRef, scrappingDateRef, warehouseIdRef, statusRef, numberRef, itemProductIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
