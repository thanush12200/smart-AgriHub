import Badge from '../Badge';
import { EmptyState, SectionHeader } from './AdminShared';

const AdminMarketplaceTab = ({
  productForm,
  setProductForm,
  createProduct,
  products,
  lowStockProducts,
  inlineEdit,
  setInlineEdit,
  updateInlineField,
  updateProductPrice,
  updateProductStock,
  toggleProductActive,
  saveInlineEdit,
  deleteProduct,
}) => (
  <div className="space-y-6">
    <div className="card p-5">
      <SectionHeader label="Inventory" title="Add New Product" />
      <form className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3" onSubmit={createProduct}>
        <input className="input" placeholder="Product code (auto if blank)" value={productForm.productCode} onChange={(e) => setProductForm((p) => ({ ...p, productCode: e.target.value }))} />
        <input className="input" placeholder="Name *" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} required />
        <input className="input" placeholder="Category *" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} required />
        <input className="input" placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm((p) => ({ ...p, brand: e.target.value }))} />
        <input className="input" placeholder="Unit (e.g. 10 kg)" value={productForm.unit} onChange={(e) => setProductForm((p) => ({ ...p, unit: e.target.value }))} />
        <input className="input" type="number" placeholder="Price (₹) *" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} required />
        <input className="input" type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
        <input className="input" type="number" step="0.1" placeholder="Rating (0–5)" value={productForm.rating} onChange={(e) => setProductForm((p) => ({ ...p, rating: Number(e.target.value) }))} />
        <input className="input" placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm((p) => ({ ...p, image: e.target.value }))} />
        <input className="input md:col-span-2 lg:col-span-3" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
        <div className="md:col-span-2 lg:col-span-3">
          <button className="btn-primary w-full" type="submit">Add Product</button>
        </div>
      </form>
    </div>

    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-xl text-slate-900">Products ({products.length})</h3>
        {lowStockProducts.length > 0 && <Badge color="red">⚠ {lowStockProducts.length} low stock</Badge>}
      </div>

      {products.length === 0 ? (
        <EmptyState icon="🛒" message="No products in the catalog yet." />
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const isLow = product.isActive && product.stock < 10;
                const edit = inlineEdit[product.productCode] || {};
                const isEditing = !!Object.keys(edit).length;

                return (
                  <tr key={product.productCode} className={`transition-colors ${isLow ? 'bg-red-50/30' : 'hover:bg-slate-50/60'}`}>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[200px] items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-200 object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=80&h=80&fit=crop';
                          }}
                        />
                        <div className="min-w-0">
                          {isEditing && edit.name !== undefined ? (
                            <input className="w-36 rounded border border-slate-300 px-2 py-1 text-xs" value={edit.name} onChange={(e) => updateInlineField(product.productCode, 'name', e.target.value)} />
                          ) : (
                            <p className="truncate font-semibold text-slate-900">{product.name}</p>
                          )}
                          <p className="font-mono text-[10px] text-slate-400">{product.productCode}</p>
                          {isLow && <span className="text-[10px] font-bold text-red-600">LOW STOCK</span>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {isEditing && edit.category !== undefined ? (
                        <input className="w-24 rounded border border-slate-300 px-2 py-1 text-xs" value={edit.category} onChange={(e) => updateInlineField(product.productCode, 'category', e.target.value)} />
                      ) : product.category}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        className="w-20 rounded border border-slate-300 px-2 py-1 text-xs font-semibold"
                        type="number"
                        defaultValue={product.price}
                        onBlur={(e) => updateProductPrice(product.productCode, e.target.value)}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          className={`w-16 rounded border px-2 py-1 text-xs font-semibold ${isLow ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300'}`}
                          type="number"
                          defaultValue={product.stock}
                          min={0}
                          onBlur={(e) => updateProductStock(product.productCode, e.target.value)}
                        />
                        <button className="rounded bg-slate-100 px-1.5 py-1 text-[10px] text-slate-600 hover:bg-slate-200" type="button" onClick={() => updateProductStock(product.productCode, product.stock + 10)}>+10</button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge color={product.isActive ? 'green' : 'slate'}>{product.isActive ? 'Active' : 'Hidden'}</Badge>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        {!isEditing ? (
                          <button
                            className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                            type="button"
                            onClick={() =>
                              setInlineEdit((p) => ({
                                ...p,
                                [product.productCode]: {
                                  name: product.name,
                                  category: product.category,
                                  brand: product.brand,
                                  image: product.image ?? '',
                                  description: product.description ?? '',
                                },
                              }))
                            }
                          >
                            Edit
                          </button>
                        ) : (
                          <>
                            <button className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100" type="button" onClick={() => saveInlineEdit(product.productCode)}>
                              Save
                            </button>
                            <button
                              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                              type="button"
                              onClick={() =>
                                setInlineEdit((p) => {
                                  const next = { ...p };
                                  delete next[product.productCode];
                                  return next;
                                })
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          className={`rounded border px-2 py-1 text-[10px] font-semibold ${product.isActive ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                          type="button"
                          onClick={() => toggleProductActive(product)}
                        >
                          {product.isActive ? 'Hide' : 'Show'}
                        </button>
                        <button className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100" type="button" onClick={() => deleteProduct(product.productCode)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

export default AdminMarketplaceTab;
