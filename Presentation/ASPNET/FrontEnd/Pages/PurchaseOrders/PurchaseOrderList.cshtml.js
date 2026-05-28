const App = {
    setup() {
        const state = Vue.reactive({
            mainData: [],
            deleteMode: false,
            hasSelection: false,
            vendorListLookupData: [],
            taxListLookupData: [],
            purchaseOrderStatusListLookupData: [],
            secondaryData: [],
            productListLookupData: [],
            mainTitle: null,
            id: '',
            number: '',
            orderDate: '',
            description: '',
            vendorId: null,
            taxId: null,
            orderStatus: null,
            errors: { orderDate: '', vendorId: '', taxId: '', orderStatus: '', description: '', itemProductId: '', itemUnitPrice: '', itemQuantity: '' },
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
        const vendorIdRef = Vue.ref(null);
        const taxIdRef = Vue.ref(null);
        const orderStatusRef = Vue.ref(null);
        const itemProductIdRef = Vue.ref(null);

        const showModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('MainModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideModal = () => { bootstrap.Modal.getInstance(document.getElementById('MainModal'))?.hide(); };
        const showItemModal = () => { bootstrap.Modal.getOrCreateInstance(document.getElementById('PurchaseOrderItemModal'), { backdrop: 'static', keyboard: false }).show(); };
        const hideItemModal = () => { bootstrap.Modal.getInstance(document.getElementById('PurchaseOrderItemModal'))?.hide(); };

        const validateForm = () => { state.errors.orderDate = ''; state.errors.vendorId = ''; state.errors.taxId = ''; state.errors.orderStatus = ''; let isValid = true; if (!state.orderDate) { state.errors.orderDate = 'Order date is required.'; isValid = false; } if (!state.vendorId) { state.errors.vendorId = 'Vendor is required.'; isValid = false; } if (!state.taxId) { state.errors.taxId = 'Tax is required.'; isValid = false; } if (!state.orderStatus) { state.errors.orderStatus = 'Order status is required.'; isValid = false; } return isValid; };
        const resetFormState = () => { state.id = ''; state.number = ''; state.orderDate = ''; state.description = ''; state.vendorId = null; state.taxId = null; state.orderStatus = null; state.errors = { orderDate: '', vendorId: '', taxId: '', orderStatus: '', description: '', itemProductId: '', itemUnitPrice: '', itemQuantity: '' }; state.secondaryData = []; state.subTotalAmount = '0.00'; state.taxAmount = '0.00'; state.totalAmount = '0.00'; state.showComplexDiv = false; };
        const resetItemFormState = () => { state.itemId = ''; state.itemProductId = null; state.itemUnitPrice = 0; state.itemQuantity = 0; state.itemSummary = ''; state.errors.itemProductId = ''; state.errors.itemUnitPrice = ''; state.errors.itemQuantity = ''; };

        const services = {
            getMainData: async () => AxiosManager.get('/PurchaseOrder/GetPurchaseOrderList', {}),
            createMainData: async (orderDate, description, orderStatus, taxId, vendorId, createdById) => AxiosManager.post('/PurchaseOrder/CreatePurchaseOrder', { orderDate, description, orderStatus, taxId, vendorId, createdById }),
            updateMainData: async (id, orderDate, description, orderStatus, taxId, vendorId, updatedById) => AxiosManager.post('/PurchaseOrder/UpdatePurchaseOrder', { id, orderDate, description, orderStatus, taxId, vendorId, updatedById }),
            deleteMainData: async (id, deletedById) => AxiosManager.post('/PurchaseOrder/DeletePurchaseOrder', { id, deletedById }),
            getVendorListLookupData: async () => AxiosManager.get('/Vendor/GetVendorList', {}),
            getTaxListLookupData: async () => AxiosManager.get('/Tax/GetTaxList', {}),
            getPurchaseOrderStatusListLookupData: async () => AxiosManager.get('/PurchaseOrder/GetPurchaseOrderStatusList', {}),
            getSecondaryData: async (purchaseOrderId) => AxiosManager.get('/PurchaseOrderItem/GetPurchaseOrderItemByPurchaseOrderIdList?purchaseOrderId=' + purchaseOrderId, {}),
            createSecondaryData: async (unitPrice, quantity, summary, productId, purchaseOrderId, createdById) => AxiosManager.post('/PurchaseOrderItem/CreatePurchaseOrderItem', { unitPrice, quantity, summary, productId, purchaseOrderId, createdById }),
            updateSecondaryData: async (id, unitPrice, quantity, summary, productId, purchaseOrderId, updatedById) => AxiosManager.post('/PurchaseOrderItem/UpdatePurchaseOrderItem', { id, unitPrice, quantity, summary, productId, purchaseOrderId, updatedById }),
            deleteSecondaryData: async (id, deletedById) => AxiosManager.post('/PurchaseOrderItem/DeletePurchaseOrderItem', { id, deletedById }),
            getProductListLookupData: async () => AxiosManager.get('/Product/GetProductList', {}),
        };

        const methods = {
            populateMainData: async () => { const r = await services.getMainData(); state.mainData = r?.data?.content?.data.map(item => ({ ...item, orderDate: new Date(item.orderDate), createdAtUtc: new Date(item.createdAtUtc) })); },
            populateVendorListLookupData: async () => { const r = await services.getVendorListLookupData(); state.vendorListLookupData = r?.data?.content?.data; },
            populateTaxListLookupData: async () => { const r = await services.getTaxListLookupData(); state.taxListLookupData = r?.data?.content?.data; },
            populatePurchaseOrderStatusListLookupData: async () => { const r = await services.getPurchaseOrderStatusListLookupData(); state.purchaseOrderStatusListLookupData = r?.data?.content?.data; },
            populateSecondaryData: async (id) => { try { const r = await services.getSecondaryData(id); state.secondaryData = r?.data?.content?.data.map(item => ({ ...item, createdAtUtc: new Date(item.createdAtUtc) })); methods.refreshPaymentSummary(id); } catch { state.secondaryData = []; } },
            populateProductListLookupData: async () => { const r = await services.getProductListLookupData(); state.productListLookupData = r?.data?.content?.data; },
            refreshPaymentSummary: (id) => { const record = state.mainData.find(item => item.id === id); if (record) { state.subTotalAmount = NumberFormatManager.formatToLocale(record.beforeTaxAmount ?? 0); state.taxAmount = NumberFormatManager.formatToLocale(record.taxAmount ?? 0); state.totalAmount = NumberFormatManager.formatToLocale(record.afterTaxAmount ?? 0); } },
            onMainModalHidden: () => { resetFormState(); taxListLookup.trackingChange = false; },
        };

        const vendorListLookup = { obj: null, create: () => { if (state.vendorListLookupData && Array.isArray(state.vendorListLookupData)) { vendorListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.vendorListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Vendor', filterBarPlaceholder: 'Search', sortOrder: 'Ascending', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.vendorListLookupData, q); }, change: (e) => { state.vendorId = e.value; } }); vendorListLookup.obj.appendTo(vendorIdRef.value); } }, refresh: () => { if (vendorListLookup.obj) vendorListLookup.obj.value = state.vendorId; } };
        const taxListLookup = { obj: null, trackingChange: false, create: () => { if (state.taxListLookupData && Array.isArray(state.taxListLookupData)) { taxListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.taxListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Tax', change: async (e) => { state.taxId = e.value; if (e.isInteracted && taxListLookup.trackingChange) { await handler.handleSubmit(); } } }); taxListLookup.obj.appendTo(taxIdRef.value); } }, refresh: () => { if (taxListLookup.obj) taxListLookup.obj.value = state.taxId; } };
        const purchaseOrderStatusListLookup = { obj: null, create: () => { if (state.purchaseOrderStatusListLookupData && Array.isArray(state.purchaseOrderStatusListLookupData)) { purchaseOrderStatusListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.purchaseOrderStatusListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select an Order Status', change: (e) => { state.orderStatus = e.value; } }); purchaseOrderStatusListLookup.obj.appendTo(orderStatusRef.value); } }, refresh: () => { if (purchaseOrderStatusListLookup.obj) purchaseOrderStatusListLookup.obj.value = state.orderStatus; } };
        const orderDatePicker = { obj: null, create: () => { orderDatePicker.obj = new ej.calendars.DatePicker({ format: 'yyyy-MM-dd', value: state.orderDate ? new Date(state.orderDate) : null, change: (e) => { state.orderDate = e.value; } }); orderDatePicker.obj.appendTo(orderDateRef.value); }, refresh: () => { if (orderDatePicker.obj) orderDatePicker.obj.value = state.orderDate ? new Date(state.orderDate) : null; } };
        const numberText = { obj: null, create: () => { numberText.obj = new ej.inputs.TextBox({ placeholder: '[auto]', readonly: true }); numberText.obj.appendTo(numberRef.value); } };
        const itemProductListLookup = { obj: null, create: () => { if (state.productListLookupData && Array.isArray(state.productListLookupData)) { itemProductListLookup.obj = new ej.dropdowns.DropDownList({ dataSource: state.productListLookupData, fields: { value: 'id', text: 'name' }, placeholder: 'Select a Product', allowFiltering: true, filtering: (e) => { e.preventDefaultAction = true; let q = new ej.data.Query(); if (e.text !== '') q = q.where('name', 'startsWith', e.text, true); e.updateData(state.productListLookupData, q); }, change: (e) => { state.itemProductId = e.value; const p = state.productListLookupData.find(x => x.id === e.value); if (p) { state.itemUnitPrice = p.unitPrice ?? 0; state.itemSummary = p.description ?? ''; state.itemQuantity = 1; } } }); itemProductListLookup.obj.appendTo(itemProductIdRef.value); } }, refresh: () => { if (itemProductListLookup.obj) itemProductListLookup.obj.value = state.itemProductId; } };

        Vue.watch(() => state.orderDate, () => { orderDatePicker.refresh(); state.errors.orderDate = ''; });
        Vue.watch(() => state.vendorId, () => { vendorListLookup.refresh(); state.errors.vendorId = ''; });
        Vue.watch(() => state.taxId, () => { taxListLookup.refresh(); state.errors.taxId = ''; });
        Vue.watch(() => state.orderStatus, () => { purchaseOrderStatusListLookup.refresh(); state.errors.orderStatus = ''; });
        Vue.watch(() => state.itemProductId, () => { state.errors.itemProductId = ''; itemProductListLookup.refresh(); });

        const handler = {
            openAdd: () => { state.deleteMode = false; state.mainTitle = 'Add Purchase Order'; resetFormState(); showModal(); },
            openEdit: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = false; state.mainTitle = 'Edit Purchase Order'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.orderDate = row.orderDate ? new Date(row.orderDate) : null; state.description = row.description ?? ''; state.vendorId = row.vendorId ?? ''; state.taxId = row.taxId ?? ''; taxListLookup.trackingChange = true; state.orderStatus = String(row.orderStatus ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = true; showModal(); },
            openDelete: async () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.deleteMode = true; state.mainTitle = 'Delete Purchase Order?'; state.id = row.id ?? ''; state.number = row.number ?? ''; state.orderDate = row.orderDate ? new Date(row.orderDate) : null; state.description = row.description ?? ''; state.vendorId = row.vendorId ?? ''; state.taxId = row.taxId ?? ''; state.orderStatus = String(row.orderStatus ?? ''); await methods.populateSecondaryData(row.id); secondaryGrid.refresh(); state.showComplexDiv = false; showModal(); },
            printPdf: () => { const row = mainGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; window.open('/PurchaseOrders/PurchaseOrderPdf?id=' + (row.id ?? ''), '_blank'); },
            exportExcel: () => { mainGrid.obj?.button(0).trigger(); },
            handleSubmit: async function () {
                try {
                    state.isSubmitting = true; await new Promise(r => setTimeout(r, 300));
                    if (!validateForm()) return;
                    const response = state.id === '' ? await services.createMainData(state.orderDate, state.description, state.orderStatus, state.taxId, state.vendorId, StorageManager.getUserId()) : state.deleteMode ? await services.deleteMainData(state.id, StorageManager.getUserId()) : await services.updateMainData(state.id, state.orderDate, state.description, state.orderStatus, state.taxId, state.vendorId, StorageManager.getUserId());
                    if (response.data.code === 200) {
                        await methods.populateMainData(); mainGrid.refresh();
                        if (!state.deleteMode) { state.mainTitle = 'Edit Purchase Order'; const d = response?.data?.content?.data; state.id = d.id ?? ''; state.number = d.number ?? ''; state.orderDate = d.orderDate ? new Date(d.orderDate) : null; state.description = d.description ?? ''; state.vendorId = d.vendorId ?? ''; state.taxId = d.taxId ?? ''; taxListLookup.trackingChange = true; state.orderStatus = String(d.orderStatus ?? ''); state.showComplexDiv = true; await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); methods.refreshPaymentSummary(state.id); Swal.fire({ icon: 'success', title: 'Save Successful', timer: 1000, showConfirmButton: false }); }
                        else { Swal.fire({ icon: 'success', title: 'Delete Successful', text: 'Form will be closed...', timer: 2000, showConfirmButton: false }); setTimeout(() => { hideModal(); resetFormState(); }, 2000); }
                    } else { Swal.fire({ icon: 'error', title: state.deleteMode ? 'Delete Failed' : 'Save Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isSubmitting = false; }
            },
            openAddItem: () => { state.itemDeleteMode = false; state.itemTitle = 'Add Item'; resetItemFormState(); showItemModal(); },
            openEditItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = false; state.itemTitle = 'Edit Item'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemUnitPrice = row.unitPrice ?? 0; state.itemQuantity = row.quantity ?? 0; state.itemSummary = row.summary ?? ''; showItemModal(); },
            openDeleteItem: () => { const row = secondaryGrid.obj?.rows({ selected: true }).data()[0]; if (!row) return; state.itemDeleteMode = true; state.itemTitle = 'Delete Item?'; state.itemId = row.id ?? ''; state.itemProductId = row.productId ?? null; state.itemUnitPrice = row.unitPrice ?? 0; state.itemQuantity = row.quantity ?? 0; state.itemSummary = row.summary ?? ''; showItemModal(); },
            handleItemSubmit: async function () {
                try {
                    state.isItemSubmitting = true; await new Promise(r => setTimeout(r, 200));
                    if (!state.itemDeleteMode && !state.itemProductId) { state.errors.itemProductId = 'Product is required.'; return; }
                    if (!state.itemDeleteMode && !(state.itemQuantity > 0)) { state.errors.itemQuantity = 'Quantity must be greater than zero.'; return; }
                    const response = state.itemId === '' ? await services.createSecondaryData(state.itemUnitPrice, state.itemQuantity, state.itemSummary, state.itemProductId, state.id, StorageManager.getUserId()) : state.itemDeleteMode ? await services.deleteSecondaryData(state.itemId, StorageManager.getUserId()) : await services.updateSecondaryData(state.itemId, state.itemUnitPrice, state.itemQuantity, state.itemSummary, state.itemProductId, state.id, StorageManager.getUserId());
                    if (response.data.code === 200) { await methods.populateMainData(); mainGrid.refresh(); await methods.populateSecondaryData(state.id); secondaryGrid.refresh(); methods.refreshPaymentSummary(state.id); Swal.fire({ icon: 'success', title: state.itemDeleteMode ? 'Delete Successful' : 'Save Successful', timer: 2000, showConfirmButton: false }); setTimeout(() => { hideItemModal(); if (state.itemDeleteMode) resetItemFormState(); }, 2000); }
                    else { Swal.fire({ icon: 'error', title: 'Failed', text: response.data.message ?? 'Please check your data.', confirmButtonText: 'Try Again' }); }
                } catch (e) { Swal.fire({ icon: 'error', title: 'An Error Occurred', text: e.response?.data?.message ?? 'Please try again.', confirmButtonText: 'OK' }); }
                finally { state.isItemSubmitting = false; }
            },
        };

        Vue.onMounted(async () => {
            try {
                await SecurityManager.authorizePage(['PurchaseOrders']); await SecurityManager.validateToken();
                await methods.populateMainData(); mainGrid.create(state.mainData);
                mainModalRef.value?.addEventListener('hidden.bs.modal', methods.onMainModalHidden);
                await methods.populateVendorListLookupData(); vendorListLookup.create();
                await methods.populateTaxListLookupData(); taxListLookup.create();
                await methods.populatePurchaseOrderStatusListLookupData(); purchaseOrderStatusListLookup.create();
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
                        { data: 'orderDate', title: 'PO Date', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                        { data: 'vendorName', title: 'Vendor' },
                        { data: 'orderStatusName', title: 'Status' },
                        { data: 'afterTaxAmount', title: 'Total Amount', className: 'text-end', render: d => d != null ? Number(d).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' },
                        { data: 'createdAtUtc', title: 'Created At', render: d => d ? new Date(d).toLocaleDateString('en-GB') : '' },
                    ],
                    order: [[5, 'desc']], pageLength: 50, lengthMenu: [[10, 25, 50, 100, -1], ['10', '25', '50', '100', 'All']],
                    select: { style: 'single', info: false },
                    buttons: [{ extend: 'excelHtml5', title: 'Purchase Orders', exportOptions: { columns: ':visible' } }],
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

        return { mainModalRef, itemModalRef, orderDateRef, numberRef, vendorIdRef, taxIdRef, orderStatusRef, itemProductIdRef, state, handler };
    }
};

Vue.createApp(App).mount('#app');
