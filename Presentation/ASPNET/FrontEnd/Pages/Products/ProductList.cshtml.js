const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            productGroupListLookupData: [],
            unitMeasureListLookupData: [],
            mainTitle: null,
            id: '',
            name: '',
            number: '',
            unitPrice: '',
            description: '',
            productGroupId: null,
            unitMeasureId: null,
            physical: false,
            errors: {
                name: '',
                unitPrice: '',
                productGroupId: '',
                unitMeasureId: ''
            },
            isSubmitting: false
        });

        const mainModalRef = Vue.ref(null);
        const productGroupIdRef = Vue.ref(null);
        const unitMeasureIdRef = Vue.ref(null);
        const nameRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const unitPriceRef = Vue.ref(null);

        // ── Modal helpers ────────────────────────────────────────────────
        const showModal = () => {
            const el = document.getElementById('MainModal');
            bootstrap.Modal.getOrCreateInstance(el, { backdrop: 'static', keyboard: false }).show();
        };
        const hideModal = () => {
            bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide();
        };

        // ── Validation ───────────────────────────────────────────────────
        const validateForm = function () {
            state.errors.name = '';
            state.errors.unitPrice = '';
            state.errors.productGroupId = '';
            state.errors.unitMeasureId = '';

            let isValid = true;
            if (!state.name) { state.errors.name = 'Name is required.'; isValid = false; }
            if (!state.unitPrice) {
                state.errors.unitPrice = 'Unit price is required.'; isValid = false;
            } else if (!/^\d+(\.\d{1,2})?$/.test(state.unitPrice)) {
                state.errors.unitPrice = 'Unit price must be a numeric value with up to two decimal places.'; isValid = false;
            }
            if (!state.productGroupId) { state.errors.productGroupId = 'ProductGroup is required.'; isValid = false; }
            if (!state.unitMeasureId) { state.errors.unitMeasureId = 'UnitMeasure is required.'; isValid = false; }
            return isValid;
        };

        const resetFormState = () => {
            state.id = ''; state.name = ''; state.number = ''; state.unitPrice = '';
            state.description = ''; state.productGroupId = null; state.unitMeasureId = null;
            state.physical = false;
            state.errors = { name: '', unitPrice: '', productGroupId: '', unitMeasureId: '' };
        };

        // ── Services ─────────────────────────────────────────────────────
        const services = {
            getMainData: () => AxiosManager.get('/Product/GetProductList', {}),
            createMainData: (name, unitPrice, physical, description, productGroupId, unitMeasureId, createdById) =>
                AxiosManager.post('/Product/CreateProduct', { name, unitPrice, physical, description, productGroupId, unitMeasureId, createdById }),
            updateMainData: (id, name, unitPrice, physical, description, productGroupId, unitMeasureId, updatedById) =>
                AxiosManager.post('/Product/UpdateProduct', { id, name, unitPrice, physical, description, productGroupId, unitMeasureId, updatedById }),
            deleteMainData: (id, deletedById) =>
                AxiosManager.post('/Product/DeleteProduct', { id, deletedById }),
            getProductGroupListLookupData: () => AxiosManager.get('/ProductGroup/GetProductGroupList', {}),
            getUnitMeasureListLookupData: () => AxiosManager.get('/UnitMeasure/GetUnitMeasureList', {}),
        };

        const methods = {
            populateProductGroupListLookupData: async () => {
                const r = await services.getProductGroupListLookupData();
                state.productGroupListLookupData = r?.data?.content?.data;
            },
            populateUnitMeasureListLookupData: async () => {
                const r = await services.getUnitMeasureListLookupData();
                state.unitMeasureListLookupData = r?.data?.content?.data;
            },
            populateMainData: async () => {
                const r = await services.getMainData();
                state.mainData = r?.data?.content?.data.map(item => ({
                    ...item, createdAtUtc: new Date(item.createdAtUtc)
                }));
            },
        };

        // ── Syncfusion form controls (unchanged) ─────────────────────────
        const productGroupListLookup = {
            obj: null,
            create: () => {
                productGroupListLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.productGroupListLookupData,
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'Select a Product Group',
                    popupHeight: '200px',
                    change: (e) => { state.productGroupId = e.value; }
                });
                productGroupListLookup.obj.appendTo(productGroupIdRef.value);
            },
            refresh: () => { if (productGroupListLookup.obj) productGroupListLookup.obj.value = state.productGroupId; },
        };

        const unitMeasureListLookup = {
            obj: null,
            create: () => {
                unitMeasureListLookup.obj = new ej.dropdowns.DropDownList({
                    dataSource: state.unitMeasureListLookupData,
                    fields: { value: 'id', text: 'name' },
                    placeholder: 'Select a Unit Measure',
                    popupHeight: '200px',
                    change: (e) => { state.unitMeasureId = e.value; }
                });
                unitMeasureListLookup.obj.appendTo(unitMeasureIdRef.value);
            },
            refresh: () => { if (unitMeasureListLookup.obj) unitMeasureListLookup.obj.value = state.unitMeasureId; },
        };

        const nameText = {
            obj: null,
            create: () => { nameText.obj = new ej.inputs.TextBox({ placeholder: 'Enter Name' }); nameText.obj.appendTo(nameRef.value); },
            refresh: () => { if (nameText.obj) nameText.obj.value = state.name; }
        };
        const numberText = {
            obj: null,
            create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]', readonly: true }); numberText.obj.appendTo(numberRef.value); },
            refresh: () => { if (numberText.obj) numberText.obj.value = state.number; }
        };
        const unitPriceNumber = {
            obj: null,
            create: () => {
                unitPriceNumber.obj = new ej.inputs.NumericTextBox({ format: 'n2', placeholder: 'Enter Unit Price', min: 0, step: 0.01, validateDecimalOnType: true });
                unitPriceNumber.obj.appendTo(unitPriceRef.value);
            },
            refresh: () => { if (unitPriceNumber.obj) unitPriceNumber.obj.value = state.unitPrice; }
        };

        Vue.watch(() => state.name, () => { state.errors.name = ''; nameText.refresh(); });
        Vue.watch(() => state.number, () => { numberText.refresh(); });
        Vue.watch(() => state.unitPrice, () => { state.errors.unitPrice = ''; unitPriceNumber.refresh(); });
        Vue.watch(() => state.productGroupId, () => { state.errors.productGroupId = ''; productGroupListLookup.refresh(); });
        Vue.watch(() => state.unitMeasureId, () => { state.errors.unitMeasureId = ''; unitMeasureListLookup.refresh(); });

        // ── Handler ──────────────────────────────────────────────────────
        const handler = {
            openAdd: () => {
                state.deleteMode = false;
                state.mainTitle = 'Add Product';
                resetFormState();
                showModal();
            },
            openEdit: () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0];
                if (!row) return;
                state.deleteMode = false;
                state.mainTitle = 'Edit Product';
                mainGrid._populateState(row);
                showModal();
            },
            openDelete: () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0];
                if (!row) return;
                state.deleteMode = true;
                state.mainTitle = 'Delete Product?';
                mainGrid._populateState(row);
                showModal();
            },
            exportExcel: () => {
                mainGrid.obj?.button(0).trigger();
            },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (!validateForm()) return;

                    const response = state.id === ''
                        ? await services.createMainData(state.name, state.unitPrice, state.physical, state.description, state.productGroupId, state.unitMeasureId, StorageManager.getUserId())
                        : state.deleteMode
                            ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.name, state.unitPrice, state.physical, state.description, state.productGroupId, state.unitMeasureId, StorageManager.getUserId());

                    if (response.data.code === 200) {
                        await methods.populateMainData();
                        mainGrid.refresh();

                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Product';
                            const d = response?.data?.content?.data;
                            state.id = d.id ?? ''; state.number = d.number ?? ''; state.name = d.name ?? '';
                            state.unitPrice = d.unitPrice ?? ''; state.description = d.description ?? '';
                            state.productGroupId = d.productGroupId ?? ''; state.unitMeasureId = d.unitMeasureId ?? '';
                            state.physical = d.physical ?? false;
                        }

                        Swal.fire({ icon: 'success', title: state.deleteMode ? 'Delete Successful' : 'Save Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideModal(); if (state.deleteMode) resetFormState(); }, 2000);

                    } else {
                        Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'An Error Occurred', text: error.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' });
                } finally {
                    state.isSubmitting = false;
                }
            },
        };

        // ── Lifecycle ────────────────────────────────────────────────────
        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['Products']);
                await SecurityManager.validateToken();

                await methods.populateMainData();
                mainGrid.create(state.mainData);

                await methods.populateProductGroupListLookupData();
                productGroupListLookup.create();
                await methods.populateUnitMeasureListLookupData();
                unitMeasureListLookup.create();

                nameText.create();
                numberText.create();
                unitPriceNumber.create();

                mainModalRef.value?.addEventListener('hidden.bs.modal', () => resetFormState());
            } catch (e) {
                console.error('page init error:', e);
            }
        });

        Vue.onUnmounted(() => {
            mainModalRef.value?.removeEventListener('hidden.bs.modal', resetFormState);
            if (mainGrid.obj) mainGrid.obj.destroy();
        });

        // ── DataTables grid ──────────────────────────────────────────────
        const mainGrid = {
            obj: null,

            create: (dataSource) => {
                mainGrid.obj = new DataTable('#mainGrid', {
                    data: dataSource,
                    columns: [
                        { data: 'number',           title: 'Number' },
                        { data: 'name',             title: 'Name' },
                        { data: 'productGroupName', title: 'Product Group' },
                        {
                            data: 'unitPrice',
                            title: 'Unit Price',
                            className: 'text-end',
                            render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
                        },
                        { data: 'unitMeasureName',  title: 'Unit Measure' },
                        {
                            data: 'physical',
                            title: 'Physical',
                            className: 'text-center',
                            render: d => d ? '<i class="ti ti-check text-success"></i>' : '<span class="text-muted">—</span>'
                        },
                        {
                            data: 'createdAtUtc',
                            title: 'Created At',
                            render: d => d ? new Date(d).toLocaleDateString('en-GB') : ''
                        },
                    ],
                    order: [[6, 'desc']],
                    pageLength: 50,
                    lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [
                        { extend: 'excelHtml5', title: 'Products', exportOptions: { columns: ':visible' } }
                    ],
                    layout: {
                        topStart: null,
                        topEnd: { search: { placeholder: 'Search...' } },
                        bottomStart: 'info',
                        bottomEnd: 'paging'
                    }
                });

                mainGrid.obj.on('select deselect', () => {
                    state.hasSelection = mainGrid.obj.rows({ selected: true }).count() > 0;
                });
            },

            refresh: () => {
                mainGrid.obj.clear().rows.add(state.mainData).draw();
            },

            _populateState: (row) => {
                state.id             = row.id             ?? '';
                state.number         = row.number         ?? '';
                state.name           = row.name           ?? '';
                state.unitPrice      = row.unitPrice      ?? '';
                state.description    = row.description    ?? '';
                state.productGroupId = row.productGroupId ?? '';
                state.unitMeasureId  = row.unitMeasureId  ?? '';
                state.physical       = row.physical       ?? false;
            }
        };

        return {
            mainModalRef,
            productGroupIdRef,
            unitMeasureIdRef,
            nameRef,
            numberRef,
            unitPriceRef,
            state,
            handler,
        };
    }
};

Vue.createApp(App).mount('#app');