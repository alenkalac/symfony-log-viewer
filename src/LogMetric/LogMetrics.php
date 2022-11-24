<?php

namespace Kira0269\LogViewerBundle\LogMetric;

class LogMetrics
{
    /* Available metric types */
    const METRIC_TYPE_COUNTER = 'counter';
    const METRIC_TYPE_ACCUMULATOR = 'accumulator';

    const METRIC_TYPES = [
        self::METRIC_TYPE_COUNTER => LogsCounter::class,
        self::METRIC_TYPE_ACCUMULATOR => LogsAccumulator::class
    ];

    private array $groups;

    private array $metrics;

    public function __construct(array $groups, array $metricsConfig)
    {
        $this->groups = $groups;
        $this->initMetrics($metricsConfig);
    }

    private function initMetrics(array $metricsConfig)
    {
        $this->metrics = [];
        foreach ($metricsConfig as $id => $metricConfig) {
            $metricType = $metricConfig['type'];
            $metricClass = $this->getMetricClass($metricType);
            $this->metrics[$id] = new $metricClass($metricConfig, $this->groups);
        }
    }

    /**
     * @param string $metricType
     * @return string
     */
    private function getMetricClass(string $metricType): string
    {
        return self::METRIC_TYPES[$metricType];
    }

    /**
     * @param array $logs
     * @return LogsCounter[]
     */
    public function getMetricsResults(array $logs): array
    {
        foreach ($this->metrics as $id => $metric) {
            $metric->calculate($logs);
        }

        return $this->metrics;
    }
}