#!/usr/bin/env ruby
# frozen_string_literal: true

require "xcodeproj"

project_path = File.expand_path("../ios/Runner.xcodeproj", __dir__)
project = Xcodeproj::Project.open(project_path)

runner_target = project.targets.find { |target| target.name == "Runner" }
abort("Runner target not found in #{project_path}") unless runner_target

runner_target.build_configurations.each do |config|
  settings = config.build_settings
  settings["PRODUCT_BUNDLE_IDENTIFIER"] = "com.wuwu0102.hvacconverter"
  settings["DEVELOPMENT_TEAM"] = "77LPMPBV88"
  settings["CODE_SIGN_STYLE"] = "Automatic"
end

project.save
puts "Updated Runner target build settings in #{project_path}"
