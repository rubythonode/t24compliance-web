json.array!(@curve_double_quadratics) do |curve_double_quadratic|
  json.extract! curve_double_quadratic, :id, :name, :curve_coefficient1, :curve_coefficient2, :curve_coefficient3, :curve_coefficient4, :curve_coefficient5, :curve_coefficient6, :curve_maximum_out, :curve_maximum_var1, :curve_maximum_var2, :curve_minimum_out, :curve_minimum_var1, :curve_minimum_var2
  json.url curve_double_quadratic_url(curve_double_quadratic, format: :json)
end
