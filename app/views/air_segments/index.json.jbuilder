json.array!(@air_segments) do |air_segment|
  json.extract! air_segment, :id, :name, :type, :path
  json.url air_segment_url(air_segment, format: :json)
end
