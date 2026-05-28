const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            customerListLookupData: [],
            taxListLookupData: [],
            salesOrderStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            orderDate: '',
            description: '',
            customerId: null,
            taxId: null,
            orderStatus: null,
            errors: {
                orderDate: '',
                customerId: '',
                taxId: '',
                orderStatus: '',
                description: '',
                itemProductId: '',
                itemUnitPrice: '',
                itemQuantity: '',
            },
            showComplexDiv: false,
            isSubmitting: false,
            subTotalAmount: '0.00',
            taxAmount: '0.00',
            totalAmount: '0.00',
            hasItemSelection: false,
            itemDeleteMode: false,
            isItemSubmitting: false,
            itemTitle: '',
            itemId: '',
            itemProductId: null,
            itemUnitPrice: 0,
            itemQuantity: 0,
            itemSummary: '',
        });

        const mainModalRef = Vue.ref(null);
        const itemModalRef = Vue.ref(null);
        const orderDateRef = Vue.ref(null);
        const numberRef = Vue.ref(null);
        const customerIdRef = Vue.ref(null);
        const taxIdRef = Vue.ref(null);
        const orderStatusRef = Vue.ref(null);
        const itemProductIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };
        const showItemModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('SalesOrderItemModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideItemModal = () => { bootstrap.Modal.getInstance(document.getElementById('SalesOrderItemModal'))?.hide(); };

        const validateForm = function () {
            state.errors.orderDate = ''; state.errors.customerId = ''; state.errors.taxId = ''; state.errors.orderStatus = '';
            let isValid = true;
            if (!state.orderDate) { state.errors.orderDate = 'Order date is required.'; isValid = false; }
            if (!state.customerId) { state.errors.customerId = 'Customer is required.'; isValid = false; }
            if (!state.taxId) { state.errors.taxId = 'Tax is required.'; isValid = false; }
            if (!state.orderStatus) { state.errors.orderStatus = 'Order status is required.'; isValid = false; }
            return isValid;
        };

        const resetFormState = () => {
            state.id = ''; state.number = ''; state.orderDate = ''; state.description = '';
            state.customerId = null; state.taxId = null; state.orderStatus = null;
            state.errors = { orderDate: '', customerId: '', taxId: '', orderStatus: '', description: '', itemProductId: '', itemUnitPrice: '', itemQuantity: '' };
            state.secondaryData = []; state.subTotalAmount = '0.00'; state.taxAmount = '0.00'; state.totalAmount = '0.00'; state.showComplexDiv = false;
        };

        const resetItemFormState = () => {
            state.itemId = ''; state.itemProductId = null; state.itemUnitPrice = 0; state.itemQuantity = 0; state.itemSummary = '';
            state.errors.itemProductId = ''; state.errors.itemUnitPrice = ''; state.errors.itemQuantity = '';
        };

        const services = {
            getMainData: async () => AxiosManager.get('/SalesOrder/GetSalesOrderList', {}),
            createMainData: async (orderDate, description, orderStatus, taxId, customerId, createdById) => AxiosManager.post('/SalesOrder/CreateSalesOrder', { orderDate, description, orderStatus, taxId, customerId, createdById }),
            updateMainData: async (id, orderDate, description, orderStatus, taxId, customerId, updatedById) => AxiosManager.post('/SalesOrder/UpdateSalesOrder', { id, orderDate, description, orderStatus, taxId, customerId, updatedById }),
            deleteMainData: async (id, deletedById) => AxiosManager.post('/SalesOrder/DeleteSalesOrder', { id, deletedById }),
            getCustomerListLookupData: async () => AxiosManager.get('/Customer/GetCustomerList', {}),
            getTaxListLookupData: async () => AxiosManager.get('/Tax/GetTaxList', {}),
            getSalesOrderStatusListLookupData: async () => AxiosManager.get('/SalesOrder/GetSalesOrderStatusList', {}),
            getSecondaryData: async (salesOrderId) => AxiosManager.get('/SalesOrderItem/GetSalesOrderItemBySalesOrderIdList?salesOrderId=' + salesOrderId, {}),
            createSecondaryData: async (unitPrice, quantity, summary, productId, salesOrderId, createdById) => AxiosManager.post('/SalesOrderItem/CreateSalesOrderItem', { unitPrice, quantity, summary, productId, salesOrderId, createdById }),
            updateSecondaryData: async (id, unitPrice, quantity, summary, productId, salesOrderId, updatedById) => AxiosManager.post('/SalesOrderItem/UpdateSalesOrderItem', { id, unitPrice, quantity, summary, productId, salesOrderId, updatedById }),
            deleteSecondaryData: async (id, deletedById) => AxiosManager.post('/SalesOrderItem/DeleteSalesOrderItem', { id, deletedById }),
            getProductListLookupData: async () => AxiosManager.get('/Product/GetProductList', {}),
        };

        const methods = {
            populateMainData: async () => {
                const r = await services.getMainData();
                state.mainData = r?.data?.content?.data.map(item => ({ ...item, orderDate: new Date(item.orderDate), createdAtUtc: new Date(item.createdAtUtc) }));
            },
            populateCustomerListLookupData: async () => { const r = await services.getCustomerListLookupData(); state.customerListLookupData = r?.data?.content?.data; },
            populateTaxListLookupData: async () => { const r = await services.getTaxListLookupData(); state.taxListLookupData = r?.data?.content?.data; },
            populateSalesOrderStatusListLookupData: async () => { const r = await services.getSalesOrderStatusListLookupData(); state.salesOrderStatusListLookupData = r?.data?.content?.data; },
            populateSecondaryData: async (salesOrderId) => {
                try { const r = await services.getSecondaryData(salesOrderId); state.secondaryData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) })); methods.refreshPaymentSummary(salesOrderId); }
                catch { state.secondaryData = []; }
            },
            populateProductListLookupData: async () => { const r = await services.getProductListLookupData(); state.productListLookupData = r?.data?.content?.data; },
            refreshPaymentSummary: (id) => {
                const record = state.mainData.find(item => item.id === id);
                if (record) { state.subTotalAmount = NumberFormatManager.formatToLocale(record.beforeTaxAmount ?? 0); state.taxAmount = NumberFormatManager.formatToLocale(record.taxAmount ?? 0); state.totalAmount = NumberFormatManager.formatToLocale(record.afterTaxAmount ?? 0); }
            },
            onMainModalHidden: () => { resetFormState(); taxListLookup.trackingChange = false; },
        };

        const customerListLookup = {
            obj: null,
            create: () => {
                if (state.customerListLookupData && Array.isArray(state.customerListLookupData)) {
                    customerListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.customerListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Customer', filterBarPlaceholder: 'Search', sortOrder: 'Ascending', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.customerListLookupData, q); }, change: (e) => { state.customerId = e.value; } });
                    customerListLookup.obj.appendTo(customerIdRef.value);
                }
            },
            refresh: () => { if (customerListLookup.obj) customerListLookup.obj.value = state.customerId; }
        };

        const taxListLookup = {
            obj: null,
            trackingChange: false,
            create: () => {
                if (state.taxListLookupData && Array.isArray(state.taxListLookupData)) {
                    taxListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.taxListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Tax',
                        change: async (e) => { state.taxId = e.value; if (e.isInteracted && taxListLookup.trackingChange) { await handler.handleSubmit(); } }
                    });
                    taxListLookup.obj.appendTo(taxIdRef.value);
                }
            },
            refresh: () => { if (taxListLookup.obj) taxListLookup.obj.value = state.taxId; }
        };

        const salesOrderStatusListLookup = {
            obj: null,
            create: () => {
                if (state.salesOrderStatusListLookupData && Array.isArray(state.salesOrderStatusListLookupData)) {
                    salesOrderStatusListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.salesOrderStatusListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select an Order Status', change: (e) => { state.orderStatus = e.value; } });
                    salesOrderStatusListLookup.obj.appendTo(orderStatusRef.value);
                }
            },
            refresh: () => { if (salesOrderStatusListLookup.obj) salesOrderStatusListLookup.obj.value = state.orderStatus; }
        };

        const orderDatePicker = {
            obj: null,
            create: () => { orderDatePicker.obj = new ej.calendars.DatePicker({ format: 'yyyy-MM-dd', value: state.orderDate ? new Date(state.orderDate) : null, change: (e) => { state.orderDate = e.value; } }); orderDatePicker.obj.appendTo(orderDateRef.value); },
            refresh: () => { if (orderDatePicker.obj) orderDatePicker.obj.value = state.orderDate ? new Date(state.orderDate) : null; }
        };

        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]', readonly: true }); numberText.obj.appendTo(numberRef.value); } };

        const itemProductListLookup = {
            obj: null,
            create: () => {
                if (state.productListLookupData && Array.isArray(state.productListLookupData)) {
                    itemProductListLookup.obj = new ej.dropdowns.DropDownList({
                        dataSource: state.productListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Product', allowFiltering: true,
                        filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.productListLookupData, q); },
                        change: (e) => { state.itemProductId = e.value; const p = state.productListLookupData.find(x => x.id === e.value); if (p) { state.itemUnitPrice = p.unitPrice ?? 0; state.itemSummary = p.description ?? ''; state.itemQuantity = 1; } }
                    });
                    itemProductListLookup.obj.appendTo(itemProductIdRef.value);
                }
            },
            refresh: () => { if (itemProductListLookup.obj) itemProductListLookup.obj.value = state.itemProductId; }
        };

        Vue.watch(() => state.orderDate, () => { orderDatePicker.refresh(); state.errors.orderDate = ''; });
        Vue.watch(() => state.customerId, () => { customerListLookup.refresh(); state.errors.customerId = ''; });
        Vue.watch(() => state.taxId, () => { taxListLookup.refresh(); state.errors.taxId = ''; });
        Vue.watch(() => state.orderStatus, () => { salesOrderStatusListLookup.refresh(); state.errors.orderStatus = ''; });
        Vue.watch(() => state.itemProductId, () => { state.errors.itemProductId = ''; itemProductListLookup.refresh(); });

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Sales Order'; resetFormState(); showModal(); },
            openEdit: async () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                state.deleteMode = false; state.mainTitle = 'Edit Sales Order';
                state.id = row.id ?? ''; state.number = row.number ?? '';
                state.orderDate = row.orderDate ? new Date(row.orderDate) : null;
                state.description = row.description ?? ''; state.customerId = row.customerId ?? '';
                state.taxId = row.taxId ?? ''; taxListLookup.trackingChange = true;
                state.orderStatus = String(row.orderStatus ?? '');
                await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = true;
                showModal();
            },
            openDelete: async () => {
                const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return;
                state.deleteMode = true; state.mainTitle = 'Delete Sales Order?';
                state.id = row.id ?? ''; state.number = row.number ?? '';
                state.orderDate = row.orderDate ? new Date(row.orderDate) : null;
                state.description = row.description ?? ''; state.customerId = row.customerId ?? '';
                state.taxId = row.taxId ?? ''; state.orderStatus = String(row.orderStatus ?? '');
                await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = false;
                showModal();
            },
            printPdf: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; window.open('/SalesOrders/SalesOrderPdf?id=' + (row.id ?? ''), '_blank'); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (!validateForm()) return;
                    const response = state.id === ''
                        ? await services.createMainData(state.orderDate, state.description, state.orderStatus, state.taxId, state.customerId, StorageManager.getUserId())
                        : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId())
                            : await services.updateMainData(state.id, state.orderDate, state.description, state.orderStatus, state.taxId, state.customerId, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) {
                            state.mainTitle = 'Edit Sales Order';
                            const d = response?.data?.content?.data;
                            state.id = d.id ?? ''; state.number = d.number ?? '';
                            state.orderDate = d.orderDate ? new Date(d.orderDate) : null;
                            state.description = d.description ?? ''; state.customerId = d.customerId ?? '';
                            state.taxId = d.taxId ?? ''; taxListLookup.trackingChange = true;
                            state.orderStatus = String(d.orderStatus ?? ''); state.showComplexDiv = true;
                            await methods.populateSecondaryData(state.id); secondaryGrid.refresh();
                            methods.refreshPaymentSummary(state.id);
                            Swal.fire({ icon: 'success', title: 'Save Successful', timer: 1000, showConfirmButton: false });
                        } else {
                            Swal.fire({ icon: 'success', title: 'Delete Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false });
                            setTimeout(() => { hideModal(); resetFormState(); }, 2000);
                        }
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
            openAddItem: () => { state.itemDeleteMode = false; state.itemTitle = 'Add Item'; resetItemFormState(); showItemModal(); },
            openEditItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = false; state.itemTitle = 'Edit Item'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemUnitPrice = row.unitPrice ?? 0; state.itemQuantity = row.quantity ?? 0; state.itemSummary = row.summary ?? ''; showItemModal(); },
            openDeleteItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = true; state.itemTitle = 'Delete Item?'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemUnitPrice = row.unitPrice ?? 0; state.itemQuantity = row.quantity ?? 0; state.itemSummary = row.summary ?? ''; showItemModal(); },
            handleItemSubmit: async function () {
                try {
                    state.isItemSubmitting = true;
                    await new Promise(resolve => setTimeout(resolve, 200));
                    if (!state.itemDeleteMode && !state.itemProductId) { state.errors.itemProductId = 'Product is required.'; return; }
                    if (!state.itemDeleteMode && !(state.itemQuantity > 0)) { state.errors.itemQuantity = 'Quantity must be greater than zero.'; return; }
                    const response = state.itemId === ''
                        ? await services.createSecondaryData(state.itemUnitPrice, state.itemQuantity, state.itemSummary, state.itemProductId, state.id, StorageManager.getUserId())
                        : state.itemDeleteMode ? await services.deleteSecondaryData(state.itemId, StorageManager.getUserId())
                            : await services.updateSecondaryData(state.itemId, state.itemUnitPrice, state.itemQuantity, state.itemSummary, state.itemProductId, state.id, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        await methods.populateSecondaryData(state.id); secondaryGrid.refresh();
                        methods.refreshPaymentSummary(state.id);
                        Swal.fire({ icon: 'success', title: state.itemDeleteMode ? 'Delete Successful' : 'Save Successful', timer: 2000, showConfirmButton: false });
                        setTimeout(() => { hideItemModal(); if (state.itemDeleteMode) resetItemFormState(); }, 2000);
                    } else { Swal.fire({ icon: 'error', title: 'Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isItemSubmitting = false; }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['SalesOrders']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateCustomerListLookupData(); customerListLookup.create();
                await methods.populateTaxListLookupData(); taxListLookup.create();
                await methods.populateSalesOrderStatusListLookupData(); salesOrderStatusListLookup.create();
                orderDatePicker.create(); numberText.create();
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
                        { data: 'orderDate', title: 'SO Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'customerName', title: 'Customer' },
                        { data: 'orderStatusName', title: 'Status' },
                        { data: 'afterTaxAmount', title: 'Total Amount', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[5, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Sales Orders', exportOptions: { columns: ':visible' } }],
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
                        { data: 'productId', title: 'Product', render: d => { const p = state.productListLookupData.find(x => x.id === d); return p ? p.name : (d ?? ''); } },
                        { data: 'unitPrice', title: 'Unit Price', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'quantity', title: 'Quantity', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'total', title: 'Total', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'summary', title: 'Summary' },
                    ],
                    order: [[0, 'asc']], paging: false,
                    select: { style: 'single', info: false },
                    layout: { topStart: null, topEnd: null, bottomStart: null, bottomEnd: null }
                });
                secondaryGrid.obj.on('select deselect', () => { state.hasItemSelection = secondaryGrid.obj.rows({ selected: true }).count() > 0; });
            },
            refresh: () => { secondaryGrid.obj.clear().rows.add(state.secondaryData).draw(); },
        };

        return { mainModalRef, itemModalRef, orderDateRef, numberRef, customerIdRef, taxIdRef, orderStatusRef, itemProductIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
