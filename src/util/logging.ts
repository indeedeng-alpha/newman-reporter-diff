// typescript-logging configuration
import {
    LoggerFactory,
    LoggerFactoryOptions,
    getLogControl,
    LFService,
    LogGroupRule,
    LogLevel,
    LogGroupControlSettings
} from "typescript-logging";

const options = new LoggerFactoryOptions()
    // .addLogGroupRule(new LogGroupRule(new RegExp("model.+"), LogLevel.Debug))
    .addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));

// Create a named loggerfactory and pass in the options and export the factory.
export const loggerfactory = LFService.createNamedLoggerFactory("newman-reporter-diff.LoggerFactory", options);


export function changeLogLevel(settings: any) {
    const logControl = getLogControl();
    const factoryControl = logControl.getLoggerFactoryControl(0);
    factoryControl.change(settings);
}
